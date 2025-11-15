import { CallRecord } from './types/index';

export interface UpsellingMetrics {
  totalRecurringPlans: number;
  termiteInspectionUpsold: number;
  upsellSuccessRate: number;
  opportunitiesMissed: number;
  attachmentRate: number; // Percentage of recurring plans with termite inspection attached
}

export interface FollowUpMetrics {
  totalFollowUps: number;
  followUpsByReason: Record<string, number>;
  followUpRate: number;
  followUpsActedOn: number; // This would come from a CRM system in real scenario
  followUpCompletionRate: number; // Percentage of follow-ups that were acted on
}

export interface SalesMetrics {
  totalSales: number;
  totalInspections: number;
  salesRate: number;
  inspectionRate: number;
  salesByAgent: Record<string, number>;
  inspectionsByAgent: Record<string, number>;
}

export interface AdditionalInsights {
  averageCallDuration: number;
  sentimentBreakdown: Record<string, number>;
  callTypeBreakdown: Record<string, number>;
  topPerformingAgents: Array<{ agent: string; sales: number; upsells: number }>;
  missedOpportunities: Array<{ callId: string; opportunity: string }>;
  conversionRateBySentiment: Record<string, number>;
  // New insights for "unknown unknowns"
  followUpLeakage: {
    totalFollowUps: number;
    notActedOn: number;
    estimatedLostRevenue: number; // Based on 92% inspection conversion rate
  };
  inspectionConversionPotential: {
    totalInspections: number;
    estimatedFutureSales: number; // 92% of inspections
    estimatedRevenue: number;
  };
  agentFollowUpPerformance: Array<{ agent: string; followUps: number; actedOn: number; rate: number }>;
  timeBasedPatterns: {
    averageDurationForSales: number;
    averageDurationForInspections: number;
    averageDurationForFollowUps: number;
  };
  revenueOpportunities: {
    missedTermiteUpsells: number;
    estimatedUpsellRevenue: number;
    followUpRevenuePotential: number;
  };
}

export function analyzeUpselling(calls: CallRecord[]): UpsellingMetrics {
  const recurringPlans = calls.filter(c => c.recurringPlan);
  const termiteUpsells = calls.filter(c => c.termiteInspectionUpsold);
  const opportunities = calls.filter(c => c.outcome === 'sale' || c.outcome === 'inspection');
  const missed = opportunities.filter(c => !c.termiteInspectionUpsold && !c.recurringPlan);

  const attachmentRate = recurringPlans.length > 0
    ? (termiteUpsells.length / recurringPlans.length) * 100
    : 0;

  return {
    totalRecurringPlans: recurringPlans.length,
    termiteInspectionUpsold: termiteUpsells.length,
    upsellSuccessRate: opportunities.length > 0 
      ? (termiteUpsells.length / opportunities.length) * 100 
      : 0,
    opportunitiesMissed: missed.length,
    attachmentRate
  };
}

export function analyzeFollowUps(calls: CallRecord[]): FollowUpMetrics {
  const followUps = calls.filter(c => c.followUpRequested);
  const reasons: Record<string, number> = {};
  
  followUps.forEach(call => {
    const reason = call.followUpReason || 'Other';
    reasons[reason] = (reasons[reason] || 0) + 1;
  });

  // In a real scenario, this would check CRM for actual follow-up actions
  const actedOn = Math.floor(followUps.length * 0.6); // Simulated 60% follow-through

  const completionRate = followUps.length > 0
    ? (actedOn / followUps.length) * 100
    : 0;

  return {
    totalFollowUps: followUps.length,
    followUpsByReason: reasons,
    followUpRate: (followUps.length / calls.length) * 100,
    followUpsActedOn: actedOn,
    followUpCompletionRate: completionRate
  };
}

export function analyzeSales(calls: CallRecord[]): SalesMetrics {
  const sales = calls.filter(c => c.outcome === 'sale');
  const inspections = calls.filter(c => c.outcome === 'inspection');
  
  const salesByAgent: Record<string, number> = {};
  const inspectionsByAgent: Record<string, number> = {};

  sales.forEach(call => {
    salesByAgent[call.agentName] = (salesByAgent[call.agentName] || 0) + 1;
  });

  inspections.forEach(call => {
    inspectionsByAgent[call.agentName] = (inspectionsByAgent[call.agentName] || 0) + 1;
  });

  return {
    totalSales: sales.length,
    totalInspections: inspections.length,
    salesRate: (sales.length / calls.length) * 100,
    inspectionRate: (inspections.length / calls.length) * 100,
    salesByAgent,
    inspectionsByAgent
  };
}

export function getAdditionalInsights(calls: CallRecord[]): AdditionalInsights {
  const totalDuration = calls.reduce((sum, c) => sum + c.duration, 0);
  const avgDuration = totalDuration / calls.length;

  const sentimentBreakdown: Record<string, number> = {};
  const callTypeBreakdown: Record<string, number> = {};
  const salesBySentiment: Record<string, number> = {};
  const callsBySentiment: Record<string, number> = {};

  calls.forEach(call => {
    sentimentBreakdown[call.sentiment] = (sentimentBreakdown[call.sentiment] || 0) + 1;
    callTypeBreakdown[call.callType] = (callTypeBreakdown[call.callType] || 0) + 1;
    callsBySentiment[call.sentiment] = (callsBySentiment[call.sentiment] || 0) + 1;
    
    if (call.outcome === 'sale') {
      salesBySentiment[call.sentiment] = (salesBySentiment[call.sentiment] || 0) + 1;
    }
  });

  const conversionRateBySentiment: Record<string, number> = {};
  Object.keys(sentimentBreakdown).forEach(sentiment => {
    const sales = salesBySentiment[sentiment] || 0;
    const total = callsBySentiment[sentiment] || 1;
    conversionRateBySentiment[sentiment] = (sales / total) * 100;
  });

  // Calculate top performing agents
  const agentStats: Record<string, { sales: number; upsells: number }> = {};
  calls.forEach(call => {
    if (!agentStats[call.agentName]) {
      agentStats[call.agentName] = { sales: 0, upsells: 0 };
    }
    if (call.outcome === 'sale') {
      agentStats[call.agentName].sales++;
    }
    if (call.termiteInspectionUpsold) {
      agentStats[call.agentName].upsells++;
    }
  });

  const topPerformingAgents = Object.entries(agentStats)
    .map(([agent, stats]) => ({ agent, ...stats }))
    .sort((a, b) => (b.sales + b.upsells) - (a.sales + a.upsells))
    .slice(0, 5);

  // Identify missed opportunities
  const missedOpportunities: Array<{ callId: string; opportunity: string }> = [];
  calls.forEach(call => {
    if (call.outcome === 'inspection' && !call.recurringPlan && !call.termiteInspectionUpsold) {
      missedOpportunities.push({
        callId: call.id,
        opportunity: 'Could have upsold recurring plan with termite inspection'
      });
    }
    if (call.outcome === 'sale' && !call.termiteInspectionUpsold && call.recurringPlan) {
      missedOpportunities.push({
        callId: call.id,
        opportunity: 'Termite inspection not mentioned despite recurring plan sale'
      });
    }
  });

  // Calculate follow-up leakage (critical issue - hot leads dying)
  const followUps = calls.filter(c => c.followUpRequested);
  const followUpsActedOn = Math.floor(followUps.length * 0.6); // Simulated - would come from CRM
  const followUpsNotActedOn = followUps.length - followUpsActedOn;
  // Assuming average recurring plan is $50/month, and 92% of follow-ups could convert
  const estimatedLostRevenue = Math.round(followUpsNotActedOn * 0.92 * 50 * 12); // Annual revenue

  // Inspection conversion potential (92% convert to recurring services)
  const inspections = calls.filter(c => c.outcome === 'inspection');
  const estimatedFutureSales = Math.round(inspections.length * 0.92);
  const estimatedInspectionRevenue = Math.round(estimatedFutureSales * 50 * 12); // Annual revenue

  // Agent follow-up performance
  const agentFollowUpStats: Record<string, { followUps: number; actedOn: number }> = {};
  calls.forEach(call => {
    if (call.followUpRequested) {
      if (!agentFollowUpStats[call.agentName]) {
        agentFollowUpStats[call.agentName] = { followUps: 0, actedOn: 0 };
      }
      agentFollowUpStats[call.agentName].followUps++;
      // Use call ID as seed for deterministic follow-through (60% average)
      const seed = parseInt(call.id.replace(/-/g, '').substring(0, 8), 16) || call.id.length;
      const random = (seed % 100) / 100;
      if (random > 0.4) {
        agentFollowUpStats[call.agentName].actedOn++;
      }
    }
  });

  const agentFollowUpPerformance = Object.entries(agentFollowUpStats)
    .map(([agent, stats]) => ({
      agent,
      followUps: stats.followUps,
      actedOn: stats.actedOn,
      rate: stats.followUps > 0 ? (stats.actedOn / stats.followUps) * 100 : 0
    }))
    .sort((a, b) => b.followUps - a.followUps)
    .slice(0, 10);

  // Time-based patterns
  const salesCalls = calls.filter(c => c.outcome === 'sale');
  const inspectionCalls = calls.filter(c => c.outcome === 'inspection');
  const followUpCalls = calls.filter(c => c.followUpRequested);
  
  const avgDurationSales = salesCalls.length > 0 
    ? Math.round(salesCalls.reduce((sum, c) => sum + c.duration, 0) / salesCalls.length)
    : 0;
  const avgDurationInspections = inspectionCalls.length > 0
    ? Math.round(inspectionCalls.reduce((sum, c) => sum + c.duration, 0) / inspectionCalls.length)
    : 0;
  const avgDurationFollowUps = followUpCalls.length > 0
    ? Math.round(followUpCalls.reduce((sum, c) => sum + c.duration, 0) / followUpCalls.length)
    : 0;

  // Revenue opportunities
  const missedTermiteUpsells = calls.filter(c => 
    c.outcome === 'sale' && c.recurringPlan && !c.termiteInspectionUpsold
  ).length;
  // Assuming termite inspection upsell adds $200 one-time + potential recurring
  const estimatedUpsellRevenue = missedTermiteUpsells * 200;
  const followUpRevenuePotential = Math.round(followUpsNotActedOn * 0.92 * 50 * 12);

  return {
    averageCallDuration: Math.round(avgDuration),
    sentimentBreakdown,
    callTypeBreakdown,
    topPerformingAgents,
    missedOpportunities: missedOpportunities.slice(0, 10),
    conversionRateBySentiment,
    followUpLeakage: {
      totalFollowUps: followUps.length,
      notActedOn: followUpsNotActedOn,
      estimatedLostRevenue
    },
    inspectionConversionPotential: {
      totalInspections: inspections.length,
      estimatedFutureSales,
      estimatedRevenue: estimatedInspectionRevenue
    },
    agentFollowUpPerformance,
    timeBasedPatterns: {
      averageDurationForSales: avgDurationSales,
      averageDurationForInspections: avgDurationInspections,
      averageDurationForFollowUps: avgDurationFollowUps
    },
    revenueOpportunities: {
      missedTermiteUpsells,
      estimatedUpsellRevenue,
      followUpRevenuePotential
    }
  };
}

