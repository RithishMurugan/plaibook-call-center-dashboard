import { CallRecord, RepCoachingSuggestion } from '../types/index';

export function generateRepCoachingSuggestions(calls: CallRecord[]): RepCoachingSuggestion[] {
  const agentStats: Record<string, {
    calls: number;
    sales: number;
    inspections: number;
    upsellAttempts: number;
    upsellSuccesses: number;
    followUps: number;
    followUpsActedOn: number;
    avgDuration: number;
    longCalls: number;
    longCallsWithSales: number;
  }> = {};

  // Calculate agent statistics
  calls.forEach(call => {
    if (!agentStats[call.agentName]) {
      agentStats[call.agentName] = {
        calls: 0,
        sales: 0,
        inspections: 0,
        upsellAttempts: 0,
        upsellSuccesses: 0,
        followUps: 0,
        followUpsActedOn: 0,
        avgDuration: 0,
        longCalls: 0,
        longCallsWithSales: 0
      };
    }

    const stats = agentStats[call.agentName];
    stats.calls++;
    stats.avgDuration += call.duration;

    if (call.outcome === 'sale') {
      stats.sales++;
    }
    if (call.outcome === 'inspection') {
      stats.inspections++;
    }
    if (call.upsellAttempted) {
      stats.upsellAttempts++;
      if (call.upsellSuccess) {
        stats.upsellSuccesses++;
      }
    }
    if (call.followUpRequested) {
      stats.followUps++;
      // Simulate follow-up completion (would come from CRM)
      if (Math.random() > 0.4) {
        stats.followUpsActedOn++;
      }
    }
    if (call.duration > 600) { // > 10 minutes
      stats.longCalls++;
      if (call.outcome === 'sale') {
        stats.longCallsWithSales++;
      }
    }
  });

  // Generate suggestions for each agent
  const suggestions: RepCoachingSuggestion[] = [];

  Object.entries(agentStats).forEach(([agentName, stats]) => {
    const agentCalls = calls.filter(c => c.agentName === agentName);
    const suggestionsList: RepCoachingSuggestion['suggestions'] = [];

    // Calculate rates
    const upsellAttemptRate = stats.upsellAttempts / stats.calls;
    const upsellSuccessRate = stats.upsellAttempts > 0 
      ? stats.upsellSuccesses / stats.upsellAttempts 
      : 0;
    const followUpCompletionRate = stats.followUps > 0
      ? stats.followUpsActedOn / stats.followUps
      : 0;
    const longCallClosingRate = stats.longCalls > 0
      ? stats.longCallsWithSales / stats.longCalls
      : 0;
    const inspectionToSaleRate = stats.inspections > 0
      ? stats.sales / (stats.sales + stats.inspections)
      : 0;

    // Rule 1: High upsell attempt rate but low success rate
    if (upsellAttemptRate > 0.5 && upsellSuccessRate < 0.4) {
      suggestionsList.push({
        category: 'Objection Handling',
        message: 'Work on objection handling. You\'re attempting upsells frequently but success rate is low. Practice counter-offers and value framing.',
        priority: 'high',
        metrics: {
          upsellAttemptRate: Math.round(upsellAttemptRate * 100),
          upsellSuccessRate: Math.round(upsellSuccessRate * 100)
        }
      });
    }

    // Rule 2: Many follow-ups but low completion
    if (stats.followUps > 5 && followUpCompletionRate < 0.6) {
      suggestionsList.push({
        category: 'Task Tracking',
        message: 'Improve task tracking and follow-up execution. Many customers requested callbacks but they\'re not being acted upon.',
        priority: 'high',
        metrics: {
          followUps: stats.followUps,
          completionRate: Math.round(followUpCompletionRate * 100)
        }
      });
    }

    // Rule 3: Long calls but low closing
    if (stats.longCalls > 3 && longCallClosingRate < 0.3) {
      suggestionsList.push({
        category: 'Inspection Framing',
        message: 'Improve inspection framing. You\'re spending time with customers but not converting. Focus on connecting inspections to recurring plan benefits.',
        priority: 'medium',
        metrics: {
          longCalls: stats.longCalls,
          closingRate: Math.round(longCallClosingRate * 100)
        }
      });
    }

    // Rule 4: Good at inspections but poor recurring conversions
    if (stats.inspections > stats.sales && inspectionToSaleRate < 0.3) {
      suggestionsList.push({
        category: 'Conversion Strategy',
        message: 'Coach on converting inspections to plans. You\'re great at booking inspections but need to improve follow-up to convert them to recurring plans.',
        priority: 'high',
        metrics: {
          inspections: stats.inspections,
          sales: stats.sales,
          conversionRate: Math.round(inspectionToSaleRate * 100)
        }
      });
    }

    // Rule 5: Low upsell attempt rate
    if (upsellAttemptRate < 0.3 && stats.calls > 10) {
      suggestionsList.push({
        category: 'Upsell Initiative',
        message: 'Increase upsell attempts. You have opportunities to attach termite inspections to recurring plans more frequently.',
        priority: 'medium',
        metrics: {
          upsellAttemptRate: Math.round(upsellAttemptRate * 100),
          totalCalls: stats.calls
        }
      });
    }

    if (suggestionsList.length > 0) {
      suggestions.push({
        agentName,
        suggestions: suggestionsList
      });
    }
  });

  return suggestions.sort((a, b) => {
    const highPriorityA = a.suggestions.filter(s => s.priority === 'high').length;
    const highPriorityB = b.suggestions.filter(s => s.priority === 'high').length;
    return highPriorityB - highPriorityA;
  });
}

