import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import analysis functions and data
import { loadCallsFromDemoFolder } from './data/loadCalls';
import {
  analyzeUpselling,
  analyzeFollowUps,
  analyzeSales,
  getAdditionalInsights
} from './analysis';
import { filterCalls } from './analysis/filters';
import { detectMissedOpportunityPatterns } from './analysis/patterns';
import { generateRepCoachingSuggestions } from './analysis/coaching';
import { generateNatesViewMetrics } from './analysis/natesView';
import { analyzeSalesFunnel, analyzeInspectionFunnel } from './analysis/funnels';
import { calculateRevenueImpact, RevenueAssumptions } from './analysis/revenueImpact';
import { CallRecord, FilterParams } from './types/index';

// Load calls from demo_calls folder
let allCalls: CallRecord[] = [];
try {
  allCalls = loadCallsFromDemoFolder();
  console.log(`Loaded ${allCalls.length} calls from demo_calls folder`);
} catch (error) {
  console.error('Error loading calls:', error);
  allCalls = [];
}

// Precompute and cache metrics on startup
console.log('Precomputing metrics...');
let cachedMetrics: Record<string, any> = {};

try {
  if (allCalls.length > 0) {
    console.log(`Precomputing metrics for ${allCalls.length} calls...`);
    cachedMetrics = {
      all: {
        upselling: analyzeUpselling(allCalls),
        followUps: analyzeFollowUps(allCalls),
        sales: analyzeSales(allCalls),
        insights: getAdditionalInsights(allCalls),
        natesView: generateNatesViewMetrics(allCalls),
        patterns: detectMissedOpportunityPatterns(allCalls),
        coaching: generateRepCoachingSuggestions(allCalls),
        salesFunnel: analyzeSalesFunnel(allCalls),
        inspectionFunnel: analyzeInspectionFunnel(allCalls)
      }
    };
    console.log('✓ Metrics precomputed and cached successfully');
  } else {
    console.warn('⚠ No calls loaded, metrics will be computed on demand');
    cachedMetrics = {};
  }
} catch (error) {
  console.error('✗ Error precomputing metrics:', error);
  console.error('Error details:', error instanceof Error ? error.message : String(error));
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
  cachedMetrics = {};
  console.warn('⚠ Metrics will be computed on demand (may be slower)');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Static files - serving the frontend build from PROJECT_ROOT/public
const staticFilesPath = path.join(__dirname, 'public');
app.use(express.static(staticFilesPath));

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Helper to get filtered calls and compute metrics
function getFilteredMetrics(filters: FilterParams) {
  try {
    if (!allCalls || allCalls.length === 0) {
      console.warn('No calls available, returning empty metrics');
      return {
        calls: [],
        metrics: {
          upselling: { totalRecurringPlans: 0, termiteInspectionUpsold: 0, upsellSuccessRate: 0, opportunitiesMissed: 0, attachmentRate: 0 },
          followUps: { totalFollowUps: 0, followUpsByReason: {}, followUpRate: 0, followUpsActedOn: 0, followUpCompletionRate: 0 },
          sales: { totalSales: 0, totalInspections: 0, salesRate: 0, inspectionRate: 0, salesByAgent: {}, inspectionsByAgent: {} },
          insights: {} as any,
          natesView: {} as any,
          patterns: [],
          coaching: [],
          salesFunnel: {} as any,
          inspectionFunnel: {} as any
        }
      };
    }

    const filtered = filterCalls(allCalls, filters);
    const filterKey = `${filters.agent || 'all'}-${filters.sentiment || 'all'}-${filters.callType || 'all'}`;
    
    // Check cache first
    if (cachedMetrics[filterKey] && cachedMetrics[filterKey] !== null) {
      return {
        calls: filtered,
        metrics: cachedMetrics[filterKey]
      };
    }

    // Compute and cache with individual error handling
    let metrics: any;
    try {
      metrics = {
        upselling: analyzeUpselling(filtered),
        followUps: analyzeFollowUps(filtered),
        sales: analyzeSales(filtered),
        insights: getAdditionalInsights(filtered),
        natesView: generateNatesViewMetrics(filtered),
        patterns: detectMissedOpportunityPatterns(filtered),
        coaching: generateRepCoachingSuggestions(filtered),
        salesFunnel: analyzeSalesFunnel(filtered),
        inspectionFunnel: analyzeInspectionFunnel(filtered)
      };
    } catch (metricError) {
      console.error('Error computing metrics:', metricError);
      console.error('Filtered calls count:', filtered.length);
      console.error('Error stack:', metricError instanceof Error ? metricError.stack : 'No stack');
      throw metricError;
    }
    
    cachedMetrics[filterKey] = metrics;
    return { calls: filtered, metrics };
  } catch (error) {
    console.error('Error in getFilteredMetrics:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Get all calls (with optional filtering)
app.get('/api/calls', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    
    const { calls } = getFilteredMetrics(filters);
    res.json(calls);
  } catch (error) {
    console.error('Error in /api/calls:', error);
    res.status(500).json({ error: 'Failed to load calls', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get calls by category (for drill-down)
app.get('/api/calls/category', (req, res) => {
  const category = req.query.category as string;
  const filters: FilterParams = {
    agent: req.query.agent as string || undefined,
    sentiment: req.query.sentiment as any || undefined,
    callType: req.query.callType as any || undefined
  };
  
  let filtered = filterCalls(allCalls, filters);
  
  // Filter by category
  if (category === 'upsell') {
    filtered = filtered.filter(c => c.upsellAttempted || c.termiteInspectionUpsold);
  } else if (category === 'followup') {
    filtered = filtered.filter(c => c.followUpRequested);
  } else if (category === 'sales') {
    filtered = filtered.filter(c => c.outcome === 'sale');
  } else if (category === 'inspections') {
    filtered = filtered.filter(c => c.outcome === 'inspection');
  } else if (category === 'agent-performance') {
    const agent = req.query.agent as string;
    if (agent) {
      filtered = filtered.filter(c => c.agentName === agent);
    }
  } else if (category === 'pattern') {
    const patternId = req.query.patternId as string;
    if (patternId) {
      const { metrics } = getFilteredMetrics(filters);
      const pattern = metrics.patterns.find((p: any) => p.patternId === patternId);
      if (pattern) {
        filtered = filtered.filter(c => pattern.affectedCallIds.includes(c.id));
      }
    }
  }
  
  // Return call-level details
  const details = filtered.map(c => ({
    callId: c.id,
    agentName: c.agentName,
    outcome: c.outcome,
    upsellAttempted: c.upsellAttempted || false,
    upsellSuccess: c.upsellSuccess || c.termiteInspectionUpsold,
    followUpRequested: c.followUpRequested,
    sentiment: c.sentiment,
    durationMinutes: Math.round(c.duration / 60 * 10) / 10,
    date: c.date,
    customerName: c.customerName
  }));
  
  res.json(details);
});

// Get upselling metrics (with optional filtering)
app.get('/api/analytics/upselling', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    const { metrics } = getFilteredMetrics(filters);
    res.json(metrics.upselling);
  } catch (error) {
    console.error('Error in /api/analytics/upselling:', error);
    res.status(500).json({ error: 'Failed to load upselling metrics', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get follow-up metrics (with optional filtering)
app.get('/api/analytics/follow-ups', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    const { metrics } = getFilteredMetrics(filters);
    res.json(metrics.followUps);
  } catch (error) {
    console.error('Error in /api/analytics/follow-ups:', error);
    res.status(500).json({ error: 'Failed to load follow-up metrics', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get sales metrics (with optional filtering)
app.get('/api/analytics/sales', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    const { metrics } = getFilteredMetrics(filters);
    res.json(metrics.sales);
  } catch (error) {
    console.error('Error in /api/analytics/sales:', error);
    res.status(500).json({ error: 'Failed to load sales metrics', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get additional insights (with optional filtering)
app.get('/api/analytics/insights', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    const { metrics } = getFilteredMetrics(filters);
    res.json(metrics.insights);
  } catch (error) {
    console.error('Error in /api/analytics/insights:', error);
    res.status(500).json({ error: 'Failed to load insights', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get all analytics in one call (with optional filtering)
app.get('/api/analytics', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    
    console.log('Computing analytics for filters:', filters);
    const { metrics } = getFilteredMetrics(filters);
    
    if (!metrics) {
      throw new Error('Metrics computation returned null/undefined');
    }
    
    const response = {
      upselling: metrics.upselling || {},
      followUps: metrics.followUps || {},
      sales: metrics.sales || {},
      insights: metrics.insights || {},
      natesView: metrics.natesView || {}
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in /api/analytics:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ 
      error: 'Failed to load analytics', 
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    });
  }
});

// Get Nate's View metrics
app.get('/api/nates-view', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    
    const { metrics } = getFilteredMetrics(filters);
    res.json(metrics.natesView);
  } catch (error) {
    console.error('Error in /api/nates-view:', error);
    res.status(500).json({ error: 'Failed to load Nate\'s View metrics', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get missed opportunity patterns
app.get('/api/missed-opportunity-patterns', (req, res) => {
  const filters: FilterParams = {
    agent: req.query.agent as string || undefined,
    sentiment: req.query.sentiment as any || undefined,
    callType: req.query.callType as any || undefined
  };
  
  const { metrics } = getFilteredMetrics(filters);
  res.json(metrics.patterns);
});

// Get rep coaching suggestions
app.get('/api/rep-coaching', (req, res) => {
  const filters: FilterParams = {
    agent: req.query.agent as string || undefined,
    sentiment: req.query.sentiment as any || undefined,
    callType: req.query.callType as any || undefined
  };
  
  const { metrics } = getFilteredMetrics(filters);
  res.json(metrics.coaching);
});

// Get sales funnel metrics
app.get('/api/funnels/sales', (req, res) => {
  const filters: FilterParams = {
    agent: req.query.agent as string || undefined,
    sentiment: req.query.sentiment as any || undefined,
    callType: req.query.callType as any || undefined
  };
  
  const { metrics } = getFilteredMetrics(filters);
  res.json(metrics.salesFunnel);
});

// Get inspection funnel metrics
app.get('/api/funnels/inspection', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    
    const { metrics } = getFilteredMetrics(filters);
    res.json(metrics.inspectionFunnel);
  } catch (error) {
    console.error('Error in /api/funnels/inspection:', error);
    res.status(500).json({ error: 'Failed to load inspection funnel metrics', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get revenue impact metrics
app.get('/api/revenue-impact', (req, res) => {
  try {
    const filters: FilterParams = {
      agent: req.query.agent as string || undefined,
      sentiment: req.query.sentiment as any || undefined,
      callType: req.query.callType as any || undefined
    };
    
    const { calls } = getFilteredMetrics(filters);
    
    // Parse assumptions from query params (optional)
    const assumptions: Partial<RevenueAssumptions> = {};
    if (req.query.avgRecurringPlanValue) {
      assumptions.avgRecurringPlanValue = parseFloat(req.query.avgRecurringPlanValue as string);
    }
    if (req.query.avgTermiteUpsellValue) {
      assumptions.avgTermiteUpsellValue = parseFloat(req.query.avgTermiteUpsellValue as string);
    }
    if (req.query.avgCustomerLifetimeValue) {
      assumptions.avgCustomerLifetimeValue = parseFloat(req.query.avgCustomerLifetimeValue as string);
    }
    if (req.query.inspectionConversionRate) {
      assumptions.inspectionConversionRate = parseFloat(req.query.inspectionConversionRate as string);
    }
    
    const revenueImpact = calculateRevenueImpact(calls, assumptions);
    res.json(revenueImpact);
  } catch (error) {
    console.error('Error in /api/revenue-impact:', error);
    res.status(500).json({ error: 'Failed to calculate revenue impact', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// LLM Insights endpoint - returns cached insights or empty array
// LLM is only used for a small demo subset (5-10 calls) to show Nate what's possible
// All 451 calls use heuristics for fast analysis
app.get('/api/llm-insights', async (req, res) => {
  try {
    const { loadLlmInsights } = await import('./llm/analyzeTranscripts');
    
    // Try to load cached insights first
    const cachedInsights = loadLlmInsights();
    
    if (cachedInsights.length > 0) {
      console.log(`Returning ${cachedInsights.length} cached LLM insights (demo subset)`);
      return res.json(cachedInsights);
    }
    
    // Return empty array if no cached insights
    // User must click "Analyze" button to generate demo insights
    return res.json([]);
  } catch (error) {
    console.error('Error loading LLM insights:', error);
    res.status(500).json({ error: 'Failed to load LLM insights', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Trigger LLM analysis for a small demo subset (5-10 calls)
// This is just to show Nate what LLM insights look like
// All 451 calls use fast heuristics for the main dashboard
app.post('/api/llm-insights/analyze', async (req, res) => {
  try {
    const { analyzeTranscriptsWithLLM, saveLLMInsights } = await import('./llm/analyzeTranscripts');
    
    // Only analyze a small demo subset (5-10 calls) to show Nate what's possible
    const demoLimit = 10;
    
    // Select diverse calls for demo (mix of outcomes)
    const salesCalls = allCalls.filter(c => c.outcome === 'sale').slice(0, 3);
    const inspectionCalls = allCalls.filter(c => c.outcome === 'inspection').slice(0, 3);
    const followUpCalls = allCalls.filter(c => c.followUpRequested).slice(0, 2);
    const noActionCalls = allCalls.filter(c => c.outcome === 'no_action').slice(0, 2);
    
    const demoCalls = [...salesCalls, ...inspectionCalls, ...followUpCalls, ...noActionCalls].slice(0, demoLimit);
    
    if (demoCalls.length === 0) {
      return res.status(400).json({ error: 'No calls available for demo analysis' });
    }
    
    const callsWithTranscripts = demoCalls.map(c => ({
      callId: c.id,
      transcript: c.transcript
    }));
    
    res.json({ 
      message: 'Demo LLM analysis started', 
      count: callsWithTranscripts.length,
      note: `Analyzing ${callsWithTranscripts.length} diverse calls as a demo. This will take ~10-20 seconds.`
    });
    
    // Run analysis in background
    analyzeTranscriptsWithLLM(callsWithTranscripts)
      .then(insights => {
        saveLLMInsights(insights);
        console.log(`✓ LLM demo analysis complete: ${insights.length} insights generated`);
      })
      .catch(err => {
        console.error('✗ LLM analysis error:', err);
      });
  } catch (error) {
    console.error('Error starting LLM analysis:', error);
    res.status(500).json({ error: 'Failed to start LLM analysis', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Handle all other requests by serving the frontend's index.html
app.get('*', (_req, res) => {
  const indexPath = path.join(staticFilesPath, 'index.html');
  res.sendFile(indexPath);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
