import * as fs from 'fs';
import * as path from 'path';
import { CallRecord } from '../types/index';

interface CallMetadata {
  recordingId: string;
  conversationId: string;
  call: {
    direction: string;
    type: string;
    subtype: string;
    subject: string;
    from: string;
    to: string;
    wrapupCodes: string[];
  };
  timing: {
    recording: {
      start: string;
      end: string;
      duration: string;
      durationMs: number;
    };
    conversation: {
      start: string;
      end: string;
      duration: string;
    };
    iso: {
      recordingStart: string;
      recordingEnd: string;
      conversationStart: string;
      conversationEnd: string;
    };
  };
  agents: Array<{
    id: string;
    name: string;
    email: string;
    department: string;
    title: string | null;
    state: string;
    username: string;
  }>;
  queues: Array<{
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
  }>;
  technical: {
    organizationId: string;
    provider: string;
  };
}

// Keywords to detect in transcripts for analysis
const TERMITE_KEYWORDS = ['termite', 'termite inspection', 'free termite', 'termite check'];
const RECURRING_KEYWORDS = ['recurring', 'monthly', 'ongoing', 'subscription', 'plan'];
const FOLLOWUP_KEYWORDS = ['call back', 'call me back', 'follow up', 'talk to spouse', 'talk to my', 'think about it', 'get back to you'];
const SALE_KEYWORDS = ['sign up', 'yes', 'let\'s do it', 'sounds good', 'schedule', 'book'];
const INSPECTION_KEYWORDS = ['inspection', 'check', 'look', 'examine'];

// Analyze transcript text to extract insights
function analyzeTranscript(transcript: string): {
  recurringPlan: boolean;
  termiteInspectionUpsold: boolean;
  followUpRequested: boolean;
  followUpReason?: string;
  outcome: 'sale' | 'inspection' | 'no_action' | 'follow_up';
  sentiment: 'positive' | 'neutral' | 'negative';
} {
  const lowerTranscript = transcript.toLowerCase();
  
  // Check for termite inspection mentions
  const termiteMentioned = TERMITE_KEYWORDS.some(keyword => lowerTranscript.includes(keyword));
  
  // Check for recurring plan mentions
  const recurringMentioned = RECURRING_KEYWORDS.some(keyword => lowerTranscript.includes(keyword));
  
  // Check for follow-up requests
  const followUpMentioned = FOLLOWUP_KEYWORDS.some(keyword => lowerTranscript.includes(keyword));
  
  // Determine follow-up reason
  let followUpReason: string | undefined;
  if (followUpMentioned) {
    if (lowerTranscript.includes('spouse') || lowerTranscript.includes('husband') || lowerTranscript.includes('wife')) {
      followUpReason = 'Needs to discuss with spouse';
    } else if (lowerTranscript.includes('think') || lowerTranscript.includes('consider')) {
      followUpReason = 'Needs time to consider';
    } else {
      followUpReason = 'Requested callback';
    }
  }
  
  // Determine outcome
  let outcome: 'sale' | 'inspection' | 'no_action' | 'follow_up' = 'no_action';
  if (followUpMentioned && !SALE_KEYWORDS.some(k => lowerTranscript.includes(k))) {
    outcome = 'follow_up';
  } else if (SALE_KEYWORDS.some(k => lowerTranscript.includes(k)) && recurringMentioned) {
    outcome = 'sale';
  } else if (INSPECTION_KEYWORDS.some(k => lowerTranscript.includes(k)) || lowerTranscript.includes('schedule')) {
    outcome = 'inspection';
  }
  
  // Determine sentiment (simple heuristic)
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  const positiveWords = ['great', 'excellent', 'perfect', 'yes', 'sounds good', 'love', 'happy'];
  const negativeWords = ['no', 'not interested', 'cancel', 'problem', 'issue', 'complaint', 'unhappy'];
  
  if (positiveWords.some(w => lowerTranscript.includes(w))) {
    sentiment = 'positive';
  } else if (negativeWords.some(w => lowerTranscript.includes(w))) {
    sentiment = 'negative';
  }
  
  return {
    recurringPlan: recurringMentioned && outcome === 'sale',
    termiteInspectionUpsold: termiteMentioned && recurringMentioned,
    followUpRequested: followUpMentioned,
    followUpReason,
    outcome,
    sentiment
  };
}

export function loadCallsFromDemoFolder(): CallRecord[] {
  // Path resolution: from service/dist/data (compiled) or service/src/data (ts-node-dev)
  // to root demo_calls folder
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, '../../../demo_calls'), // From service/dist/data
    path.join(__dirname, '../../../../demo_calls'), // From service/src/data
    path.join(process.cwd(), '../demo_calls'), // From service directory
    path.join(process.cwd(), 'demo_calls'), // If running from root
  ];
  
  let demoCallsPath: string | null = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      demoCallsPath = testPath;
      break;
    }
  }
  
  if (!demoCallsPath) {
    console.warn(`Demo calls folder not found. Tried paths: ${possiblePaths.join(', ')}`);
    return [];
  }
  
  console.log(`Loading calls from: ${demoCallsPath}`);
  
  const files = fs.readdirSync(demoCallsPath);
  const metadataFiles = files.filter(f => f.endsWith('_metadata.json'));
  
  const calls: CallRecord[] = [];
  
  for (const file of metadataFiles) {
    try {
      const filePath = path.join(demoCallsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const metadataRaw: any = JSON.parse(content);
      
      // Handle malformed JSON where 'call' might be under a different key (like ' ' or missing)
      let callData = metadataRaw.call;
      if (!callData) {
        // Try to find call data under any key that has 'direction' property
        for (const key in metadataRaw) {
          if (metadataRaw[key] && typeof metadataRaw[key] === 'object' && 'direction' in metadataRaw[key]) {
            callData = metadataRaw[key];
            break;
          }
        }
      }
      
      // Create a normalized metadata object
      const metadata: CallMetadata = {
        ...metadataRaw,
        call: callData || {
          direction: 'inbound',
          type: 'Call',
          subtype: 'Unknown',
          subject: 'Customer',
          from: '',
          to: '',
          wrapupCodes: []
        }
      };
      
      // Extract agent name
      const agentName = metadata.agents && metadata.agents.length > 0 ? metadata.agents[0].name : 'Unknown Agent';
      
      // Extract customer name from subject or use placeholder
      const customerName = (metadata.call && metadata.call.subject) || 'Customer';
      
      // Parse duration - handle missing timing data
      const durationMs = metadata.timing?.recording?.durationMs || 0;
      const durationSeconds = Math.floor(durationMs / 1000);
      
      // Get date - handle missing timing data
      const date = metadata.timing?.iso?.recordingStart || new Date().toISOString();
      
      // Determine call type - default to inbound if missing
      const direction = (metadata.call && metadata.call.direction) || 'inbound';
      const callType = direction === 'inbound' ? 'inbound' : 'outbound';
      
      // Since we don't have actual transcripts, we'll use a heuristic based on metadata
      // In production, you'd analyze the actual transcript
      // For demo purposes, we'll infer some patterns from duration and other metadata
      // Ensure metadata has all required fields before analysis
      const analysis = inferFromMetadata(metadata);
      
      // Generate a realistic transcript from metadata for LLM analysis
      // In production, this would be the actual transcribed audio
      const transcript = generateTranscriptFromMetadata(metadata, analysis, agentName, customerName);
      
      // Determine upsell attempt and success
      const upsellAttempted = analysis.recurringPlan || analysis.termiteInspectionUpsold;
      const upsellSuccess = analysis.termiteInspectionUpsold;
      const inspectionBooked = analysis.outcome === 'inspection';
      const planFramed = analysis.recurringPlan || analysis.termiteInspectionUpsold;
      
      calls.push({
        id: metadata.recordingId,
        agentName,
        customerName,
        date,
        duration: durationSeconds,
        transcript,
        outcome: analysis.outcome,
        recurringPlan: analysis.recurringPlan,
        termiteInspectionUpsold: analysis.termiteInspectionUpsold,
        followUpRequested: analysis.followUpRequested,
        followUpReason: analysis.followUpReason,
        sentiment: analysis.sentiment,
        callType,
        upsellAttempted,
        upsellSuccess,
        inspectionBooked,
        planFramed,
        objections: analysis.sentiment === 'negative' ? ['Price/Objection'] : [],
        priceObjection: analysis.sentiment === 'negative' && analysis.outcome === 'no_action'
      });
    } catch (error) {
      console.error(`Error loading call from ${file}:`, error);
    }
  }
  
  return calls;
}

// Infer call outcomes from metadata when transcripts aren't available
// Uses deterministic heuristics based on call duration, direction, and other metadata
function inferFromMetadata(metadata: CallMetadata): {
  recurringPlan: boolean;
  termiteInspectionUpsold: boolean;
  followUpRequested: boolean;
  followUpReason?: string;
  outcome: 'sale' | 'inspection' | 'no_action' | 'follow_up';
  sentiment: 'positive' | 'neutral' | 'negative';
} {
  const durationMs = metadata.timing?.recording?.durationMs || 0;
  const durationMinutes = durationMs / 60000;
  const isInbound = (metadata.call?.direction || 'inbound') === 'inbound';
  const recordingId = metadata.recordingId || 'unknown';
  
  // Use recordingId as a seed for deterministic but varied results
  // This ensures the same call always gets the same analysis
  let seed = 0;
  try {
    const cleanedId = recordingId.replace(/-/g, '').substring(0, 8);
    seed = parseInt(cleanedId, 16) || recordingId.length;
  } catch {
    seed = recordingId.length;
  }
  const random = (seed % 100) / 100;
  
  let outcome: 'sale' | 'inspection' | 'no_action' | 'follow_up' = 'no_action';
  let recurringPlan = false;
  let termiteInspectionUpsold = false;
  let followUpRequested = false;
  let followUpReason: string | undefined;
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  
  // Heuristic based on call duration
  if (durationMinutes > 12) {
    // Very long calls (12+ min) - likely successful sales conversations
    outcome = random > 0.25 ? 'sale' : 'inspection';
    if (outcome === 'sale') {
      recurringPlan = random > 0.3;
      termiteInspectionUpsold = recurringPlan && random > 0.4;
      sentiment = 'positive';
    } else {
      sentiment = 'neutral';
    }
  } else if (durationMinutes > 8) {
    // Long calls (8-12 min) - could be sales or detailed inspections
    if (random > 0.4) {
      outcome = 'sale';
      recurringPlan = random > 0.35;
      termiteInspectionUpsold = recurringPlan && random > 0.45;
      sentiment = 'positive';
    } else if (random > 0.6) {
      outcome = 'inspection';
      sentiment = 'neutral';
    } else {
      outcome = 'follow_up';
      followUpRequested = true;
      followUpReason = random > 0.5 ? 'Needs to discuss with spouse' : 'Needs time to consider';
      sentiment = 'neutral';
    }
  } else if (durationMinutes > 5) {
    // Medium calls (5-8 min) - inspections or follow-ups
    if (random > 0.5) {
      outcome = 'inspection';
      sentiment = 'neutral';
    } else {
      outcome = 'follow_up';
      followUpRequested = true;
      const reasons = ['Needs to discuss with spouse', 'Needs time to consider', 'Requested callback'];
      followUpReason = reasons[Math.floor(random * reasons.length)];
      sentiment = 'neutral';
    }
  } else if (durationMinutes > 2) {
    // Short-medium calls (2-5 min) - quick inspections or no action
    if (random > 0.6) {
      outcome = 'inspection';
      sentiment = 'neutral';
    } else {
      outcome = 'no_action';
      sentiment = random > 0.7 ? 'negative' : 'neutral';
    }
  } else {
    // Very short calls (< 2 min) - likely no action or quick questions
    outcome = 'no_action';
    sentiment = random > 0.8 ? 'negative' : 'neutral';
  }
  
  // Adjust for outbound calls - they're more likely to be follow-ups or no action
  if (!isInbound && outcome === 'sale') {
    // Outbound sales are less common, convert some to follow-ups
    if (random > 0.6) {
      outcome = 'follow_up';
      followUpRequested = true;
      followUpReason = 'Follow-up call';
    }
  }
  
  return {
    recurringPlan,
    termiteInspectionUpsold,
    followUpRequested,
    followUpReason,
    outcome,
    sentiment
  };
}

// Generate a realistic transcript from metadata for LLM analysis
// This allows Gemini to analyze all calls even without actual audio transcripts
function generateTranscriptFromMetadata(
  metadata: CallMetadata,
  analysis: ReturnType<typeof inferFromMetadata>,
  agentName: string,
  customerName: string
): string {
  const duration = metadata.timing?.recording?.durationMs || 0;
  const durationMinutes = Math.floor(duration / 60000);
  const isInbound = (metadata.call?.direction || 'inbound') === 'inbound';
  
  let transcript = '';
  
  // Opening
  if (isInbound) {
    transcript += `Agent: Thank you for calling Example Pest Control, this is ${agentName}. How can I help you today?\n\n`;
    transcript += `Customer: Hi, I'm ${customerName}. I'm calling about pest control services.\n\n`;
  } else {
    transcript += `Agent: Hi ${customerName}, this is ${agentName} from Example Pest Control. I'm following up on your inquiry.\n\n`;
    transcript += `Customer: Oh, hi. Yes, I was interested in your services.\n\n`;
  }
  
  // Main conversation based on outcome
  if (analysis.outcome === 'sale') {
    transcript += `Agent: Great! I'd like to tell you about our recurring pest control plan. It includes quarterly treatments and ongoing protection.\n\n`;
    if (analysis.termiteInspectionUpsold) {
      transcript += `Agent: And as a bonus, we can include a free termite inspection with your plan. Would you like to add that?\n\n`;
      transcript += `Customer: Yes, that sounds good. I'll sign up for the recurring plan with the termite inspection.\n\n`;
    } else {
      transcript += `Customer: That sounds good. I'll sign up for the recurring plan.\n\n`;
    }
    transcript += `Agent: Perfect! Let me get your information and set this up for you.\n\n`;
  } else if (analysis.outcome === 'inspection') {
    transcript += `Agent: I'd like to schedule a free inspection for your property. This will help us identify any pest issues and recommend the best treatment plan.\n\n`;
    transcript += `Customer: That would be great. When can you come out?\n\n`;
    transcript += `Agent: Let me check our schedule. How about next week?\n\n`;
    transcript += `Customer: That works for me.\n\n`;
  } else if (analysis.followUpRequested) {
    transcript += `Agent: I understand you'd like to think about it. Would you like me to call you back?\n\n`;
    if (analysis.followUpReason) {
      transcript += `Customer: Yes, ${analysis.followUpReason.toLowerCase()}. Can you call me back ${analysis.followUpReason.includes('spouse') ? 'tomorrow' : 'next week'}?\n\n`;
    } else {
      transcript += `Customer: Yes, can you call me back next week?\n\n`;
    }
    transcript += `Agent: Absolutely, I'll make a note to follow up with you.\n\n`;
  } else {
    transcript += `Agent: I can help you with pest control services. We offer one-time treatments and recurring plans.\n\n`;
    if (analysis.sentiment === 'negative') {
      transcript += `Customer: I'm not sure. It seems expensive.\n\n`;
      transcript += `Agent: I understand cost is a concern. Let me explain the value of our service.\n\n`;
      transcript += `Customer: I'll think about it. Thanks for the information.\n\n`;
    } else {
      transcript += `Customer: I'll think about it and get back to you.\n\n`;
    }
  }
  
  // Closing
  transcript += `Agent: Thank you for your time, ${customerName}. Have a great day!\n\n`;
  transcript += `Customer: Thank you, goodbye.\n\n`;
  
  // Add duration context
  transcript += `[Call duration: ${durationMinutes} minutes]`;
  
  return transcript;
}


