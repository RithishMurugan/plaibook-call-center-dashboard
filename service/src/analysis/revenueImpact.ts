import { CallRecord } from '../types/index';

export interface RevenueAssumptions {
  avgRecurringPlanValue: number; // $/month
  avgTermiteUpsellValue: number; // $ one-time
  avgCustomerLifetimeValue: number; // $ total
  inspectionConversionRate: number; // 0.92 = 92%
}

export interface RevenueImpact {
  missedFollowUps: {
    count: number;
    estimatedMonthlyLoss: number;
    description: string;
  };
  missedUpsells: {
    count: number;
    estimatedMonthlyLoss: number;
    description: string;
  };
  lostInspections: {
    count: number;
    estimatedMonthlyLoss: number;
    description: string;
  };
  priceObjections: {
    count: number;
    estimatedMonthlyLoss: number;
    description: string;
  };
  totalEstimatedMonthlyLoss: number;
  assumptions: RevenueAssumptions;
}

const DEFAULT_ASSUMPTIONS: RevenueAssumptions = {
  avgRecurringPlanValue: 150, // $150/month
  avgTermiteUpsellValue: 200, // $200 one-time
  avgCustomerLifetimeValue: 1800, // $1800 (12 months * $150)
  inspectionConversionRate: 0.92 // 92%
};

export function calculateRevenueImpact(
  calls: CallRecord[],
  assumptions: Partial<RevenueAssumptions> = {}
): RevenueImpact {
  const finalAssumptions = { ...DEFAULT_ASSUMPTIONS, ...assumptions };

  // 1. Missed Follow-ups
  // A follow-up is "missed" if it was requested but didn't result in a sale or inspection
  // We'll use the followUpCompletionRate from analysis to estimate
  const missedFollowUps = calls.filter(c => 
    c.followUpRequested && c.outcome !== 'sale' && c.outcome !== 'inspection'
  );
  // Assume 60% of follow-ups would convert (based on typical conversion rates)
  const followUpConversionRate = 0.6;
  const estimatedFollowUpLoss = missedFollowUps.length * 
    followUpConversionRate * 
    finalAssumptions.avgRecurringPlanValue;

  // 2. Missed Upsells (recurring plans sold but no termite inspection)
  const missedUpsells = calls.filter(c => 
    c.recurringPlan && !c.termiteInspectionUpsold
  );
  const estimatedUpsellLoss = missedUpsells.length * 
    finalAssumptions.avgTermiteUpsellValue;

  // 3. Lost Inspections (inspections booked but not converted to plans)
  // This is tricky - we need to estimate how many inspections didn't convert
  // For now, we'll use inspections that were booked but outcome wasn't 'sale'
  const inspectionCalls = calls.filter(c => c.outcome === 'inspection');
  // Assume 92% should convert, so 8% are lost
  const expectedConversions = Math.floor(inspectionCalls.length * finalAssumptions.inspectionConversionRate);
  const actualSales = calls.filter(c => c.outcome === 'sale').length;
  const lostInspections = Math.max(0, expectedConversions - actualSales);
  // Lost inspections = missed recurring plan revenue
  const estimatedInspectionLoss = lostInspections * 
    finalAssumptions.avgRecurringPlanValue;

  // 4. Price Objections Not Handled
  const priceObjections = calls.filter(c => 
    c.priceObjection && c.outcome === 'no_action'
  );
  // Assume 40% of price objections could be handled with negotiation
  const priceObjectionConversionRate = 0.4;
  const estimatedPriceObjectionLoss = priceObjections.length * 
    priceObjectionConversionRate * 
    finalAssumptions.avgRecurringPlanValue;

  const totalLoss = estimatedFollowUpLoss + 
    estimatedUpsellLoss + 
    estimatedInspectionLoss + 
    estimatedPriceObjectionLoss;

  return {
    missedFollowUps: {
      count: missedFollowUps.length,
      estimatedMonthlyLoss: Math.round(estimatedFollowUpLoss),
      description: `${missedFollowUps.length} follow-ups not acted on (${(followUpConversionRate * 100).toFixed(0)}% would convert)`
    },
    missedUpsells: {
      count: missedUpsells.length,
      estimatedMonthlyLoss: Math.round(estimatedUpsellLoss),
      description: `${missedUpsells.length} recurring plans sold without termite inspection upsell`
    },
    lostInspections: {
      count: lostInspections,
      estimatedMonthlyLoss: Math.round(estimatedInspectionLoss),
      description: `${lostInspections} inspections that should have converted to plans (${(finalAssumptions.inspectionConversionRate * 100).toFixed(0)}% conversion rate)`
    },
    priceObjections: {
      count: priceObjections.length,
      estimatedMonthlyLoss: Math.round(estimatedPriceObjectionLoss),
      description: `${priceObjections.length} price objections not handled (${(priceObjectionConversionRate * 100).toFixed(0)}% could be converted)`
    },
    totalEstimatedMonthlyLoss: Math.round(totalLoss),
    assumptions: finalAssumptions
  };
}

