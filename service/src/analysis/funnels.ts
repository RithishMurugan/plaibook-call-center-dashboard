import { CallRecord, SalesFunnelMetrics, InspectionFunnelMetrics } from '../types/index';

export function analyzeSalesFunnel(calls: CallRecord[]): SalesFunnelMetrics {
  const salesCalls = calls.filter(c => c.outcome === 'sale' || c.recurringPlan);
  const totalCalls = calls.length;
  const pitchesMade = calls.filter(c => c.duration > 120).length; // Assumes pitch if > 2 min
  const objectionsEncountered = calls.filter(c => 
    c.sentiment === 'negative' || c.upsellAttempted && !c.upsellSuccess
  ).length;
  const recurringPlansSold = calls.filter(c => c.recurringPlan).length;
  
  const totalDuration = salesCalls.reduce((sum, c) => sum + c.duration, 0);
  const avgDuration = salesCalls.length > 0 ? Math.round(totalDuration / salesCalls.length) : 0;

  // Agent performance
  const agentPerformance: Record<string, { calls: number; sales: number; successRate: number }> = {};
  calls.forEach(call => {
    if (!agentPerformance[call.agentName]) {
      agentPerformance[call.agentName] = { calls: 0, sales: 0, successRate: 0 };
    }
    agentPerformance[call.agentName].calls++;
    if (call.outcome === 'sale' && call.recurringPlan) {
      agentPerformance[call.agentName].sales++;
    }
  });

  Object.keys(agentPerformance).forEach(agent => {
    const stats = agentPerformance[agent];
    stats.successRate = stats.calls > 0 ? (stats.sales / stats.calls) * 100 : 0;
  });

  return {
    totalCalls,
    pitchesMade,
    objectionsEncountered,
    recurringPlansSold,
    successRate: totalCalls > 0 ? (recurringPlansSold / totalCalls) * 100 : 0,
    avgDuration,
    agentPerformance
  };
}

export function analyzeInspectionFunnel(calls: CallRecord[]): InspectionFunnelMetrics {
  const inspectionCalls = calls.filter(c => c.outcome === 'inspection');
  const totalCalls = calls.length;
  const inspectionsBooked = inspectionCalls.length;
  const predictedConversions = Math.round(inspectionsBooked * 0.92); // 92% conversion

  const totalDuration = inspectionCalls.reduce((sum, c) => sum + c.duration, 0);
  const avgDuration = inspectionCalls.length > 0 ? Math.round(totalDuration / inspectionCalls.length) : 0;

  // Agent strengths
  const agentStrengths: Record<string, { inspections: number; bookingRate: number }> = {};
  const agentCallCounts: Record<string, number> = {};
  
  calls.forEach(call => {
    agentCallCounts[call.agentName] = (agentCallCounts[call.agentName] || 0) + 1;
    if (call.outcome === 'inspection') {
      if (!agentStrengths[call.agentName]) {
        agentStrengths[call.agentName] = { inspections: 0, bookingRate: 0 };
      }
      agentStrengths[call.agentName].inspections++;
    }
  });

  Object.keys(agentStrengths).forEach(agent => {
    const totalCallsForAgent = agentCallCounts[agent] || 1;
    agentStrengths[agent].bookingRate = (agentStrengths[agent].inspections / totalCallsForAgent) * 100;
  });

  // Typical objections (inferred from negative sentiment + no action)
  const objections = calls.filter(c => 
    c.sentiment === 'negative' && c.outcome === 'no_action'
  );
  const objectionCounts: Record<string, number> = {};
  objections.forEach(call => {
    const key = call.followUpReason || 'Price/Objection';
    objectionCounts[key] = (objectionCounts[key] || 0) + 1;
  });

  const typicalObjections = Object.entries(objectionCounts)
    .map(([objection, count]) => ({ objection, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalCalls,
    inspectionsBooked,
    bookingRate: totalCalls > 0 ? (inspectionsBooked / totalCalls) * 100 : 0,
    predictedConversions,
    avgDuration,
    agentStrengths,
    typicalObjections
  };
}

