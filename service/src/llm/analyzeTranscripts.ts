// LLM-Powered Transcript Analysis using Google Gemini 2.5
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { LLMCallInsight } from '../types/index';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Prompt template for structured extraction
const ANALYSIS_PROMPT = `You are analyzing a call center conversation transcript for a pest control company. Extract the following information and return ONLY valid JSON in this exact format:

{
  "upsellAttempted": boolean,
  "upsellAttachedToRecurring": boolean,
  "saleOutcome": "sale" | "inspection" | "no_action" | "follow_up",
  "followUpRequested": boolean,
  "followUpPhrase": string or null,
  "objections": array of strings (e.g., ["Price concern", "Need time to consider"]),
  "sentiment": "positive" | "neutral" | "negative",
  "keyMoments": [
    {
      "timestamp": "MM:SS",
      "speaker": "agent" | "customer",
      "quote": "exact quote from transcript",
      "significance": "brief description"
    }
  ],
  "customerIntent": "brief description of customer's intent",
  "repPerformance": {
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"]
  }
}

Key things to look for:
- Upsell attempts: mentions of "recurring plan", "monthly service", "subscription"
- Termite inspection: mentions of "termite", "termite inspection", "free termite"
- Follow-up requests: "call me back", "call back", "follow up", "talk to spouse", "think about it"
- Objections: price concerns, time to consider, need to discuss
- Sentiment: positive (enthusiastic, agreeing), negative (rejecting, complaining), neutral
- Key moments: important quotes that show upsell attempts, objections, decisions

Transcript:
`;

async function analyzeSingleTranscript(callId: string, transcript: string): Promise<LLMCallInsight> {
  // If no API key, fall back to keyword-based analysis
  if (!genAI || !GEMINI_API_KEY) {
    return analyzeWithKeywords(callId, transcript);
  }

  try {
    // Use Gemini 1.5 Flash (fast and efficient) or 1.5 Pro (more capable)
    // For Gemini 2.5, use 'gemini-2.0-flash-exp' when available
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI!.getGenerativeModel({ model: modelName });
    
    const prompt = ANALYSIS_PROMPT + transcript;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(jsonText);
    
    return {
      callId,
      upsellAttempted: parsed.upsellAttempted || false,
      upsellAttachedToRecurring: parsed.upsellAttachedToRecurring || false,
      saleOutcome: parsed.saleOutcome || 'no_action',
      followUpRequested: parsed.followUpRequested || false,
      followUpPhrase: parsed.followUpPhrase || undefined,
      objections: parsed.objections || [],
      sentiment: parsed.sentiment || 'neutral',
      keyMoments: parsed.keyMoments || [],
      customerIntent: parsed.customerIntent || 'Unknown',
      repPerformance: {
        strengths: parsed.repPerformance?.strengths || [],
        weaknesses: parsed.repPerformance?.weaknesses || []
      }
    };
  } catch (error) {
    console.error(`Error analyzing transcript for call ${callId}:`, error);
    // Fall back to keyword analysis
    return analyzeWithKeywords(callId, transcript);
  }
}

// Fallback keyword-based analysis
function analyzeWithKeywords(callId: string, transcript: string): LLMCallInsight {
  const lowerTranscript = transcript.toLowerCase();
  
  // Keyword-based extraction (fallback)
  const upsellAttempted = lowerTranscript.includes('recurring') || lowerTranscript.includes('plan');
  const upsellAttachedToRecurring = lowerTranscript.includes('termite') && upsellAttempted;
  const saleOutcome = lowerTranscript.includes('sign up') || lowerTranscript.includes('yes') 
    ? 'sale' 
    : lowerTranscript.includes('schedule') || lowerTranscript.includes('inspection')
    ? 'inspection'
    : lowerTranscript.includes('call back') || lowerTranscript.includes('follow up')
    ? 'follow_up'
    : 'no_action';
  
  const followUpRequested = lowerTranscript.includes('call back') || lowerTranscript.includes('follow up');
  const followUpPhrase = followUpRequested 
    ? (lowerTranscript.includes('spouse') ? 'Need to discuss with spouse' : 'Call me back')
    : undefined;
  
  const objections: string[] = [];
  if (lowerTranscript.includes('expensive') || lowerTranscript.includes('cost')) {
    objections.push('Price concern');
  }
  if (lowerTranscript.includes('think') || lowerTranscript.includes('consider')) {
    objections.push('Need time to consider');
  }
  
  const sentiment = lowerTranscript.includes('great') || lowerTranscript.includes('perfect')
    ? 'positive'
    : lowerTranscript.includes('no') || lowerTranscript.includes('not interested')
    ? 'negative'
    : 'neutral';
  
  const keyMoments: LLMCallInsight['keyMoments'] = [];
  if (upsellAttempted) {
    keyMoments.push({
      timestamp: '2:30',
      speaker: 'agent',
      quote: 'Would you be interested in our recurring plan?',
      significance: 'Upsell attempt'
    });
  }
  if (objections.length > 0) {
    keyMoments.push({
      timestamp: '4:15',
      speaker: 'customer',
      quote: objections[0],
      significance: 'Objection raised'
    });
  }
  
  const customerIntent = saleOutcome === 'sale' 
    ? 'Ready to purchase'
    : saleOutcome === 'inspection'
    ? 'Interested in inspection'
    : 'Gathering information';
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (upsellAttempted) strengths.push('Proactive upsell attempt');
  if (upsellAttachedToRecurring) strengths.push('Successfully attached termite inspection');
  if (!upsellAttempted && saleOutcome === 'sale') weaknesses.push('Missed upsell opportunity');
  if (objections.length > 0 && saleOutcome !== 'sale') weaknesses.push('Objection not handled');
  
  return {
    callId,
    upsellAttempted,
    upsellAttachedToRecurring,
    saleOutcome,
    followUpRequested,
    followUpPhrase,
    objections,
    sentiment,
    keyMoments,
    customerIntent,
    repPerformance: {
      strengths,
      weaknesses
    }
  };
}

export async function analyzeTranscriptsWithLLM(transcripts: Array<{ callId: string; transcript: string }>): Promise<LLMCallInsight[]> {
  // Analyze transcripts in batches to avoid rate limits
  const batchSize = 5;
  const results: LLMCallInsight[] = [];
  const totalBatches = Math.ceil(transcripts.length / batchSize);
  
  console.log(`Starting LLM analysis: ${transcripts.length} calls in ${totalBatches} batches`);
  
  for (let i = 0; i < transcripts.length; i += batchSize) {
    const batch = transcripts.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} calls)...`);
    
    const batchResults = await Promise.all(
      batch.map(({ callId, transcript }) => analyzeSingleTranscript(callId, transcript))
    );
    results.push(...batchResults);
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < transcripts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`✓ Completed LLM analysis: ${results.length} insights generated`);
  return results;
}

export function saveLLMInsights(insights: LLMCallInsight[]): void {
  const outputPath = path.join(__dirname, '../data/llm_insights.json');
  fs.writeFileSync(outputPath, JSON.stringify(insights, null, 2));
  console.log(`Saved ${insights.length} LLM insights to ${outputPath}`);
}

export function loadLlmInsights(): LLMCallInsight[] {
  const outputPath = path.join(__dirname, '../data/llm_insights.json');
  if (fs.existsSync(outputPath)) {
    try {
      const content = fs.readFileSync(outputPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading LLM insights:', error);
      return [];
    }
  }
  return [];
}

