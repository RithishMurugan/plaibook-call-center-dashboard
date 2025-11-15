import { CallRecord } from '../types/index';

export interface MissedOpportunityPattern {
  patternId: string;
  patternName: string;
  description: string;
  count: number;
  affectedCallIds: string[];
  severity: 'high' | 'medium' | 'low';
  estimatedRevenueImpact?: number;
}

export function detectMissedOpportunityPatterns(calls: CallRecord[]): MissedOpportunityPattern[] {
  const patterns: MissedOpportunityPattern[] = [];

  // Pattern 1: Follow-up requested but not acted on
  const followUpsNotActedOn = calls.filter(c => 
    c.followUpRequested && !c.recurringPlan && c.outcome !== 'sale'
  );
  if (followUpsNotActedOn.length > 0) {
    patterns.push({
      patternId: 'followup-not-acted',
      patternName: 'Follow-up Requested But Not Acted On',
      description: 'Customers requested callbacks but no action was taken',
      count: followUpsNotActedOn.length,
      affectedCallIds: followUpsNotActedOn.map(c => c.id),
      severity: 'high',
      estimatedRevenueImpact: followUpsNotActedOn.length * 600 // $50/month * 12 months
    });
  }

  // Pattern 2: Long positive calls with no upsell attempt
  const longPositiveNoUpsell = calls.filter(c => 
    c.duration > 600 && // > 10 minutes
    c.sentiment === 'positive' &&
    !c.termiteInspectionUpsold &&
    !c.recurringPlan &&
    c.outcome !== 'sale'
  );
  if (longPositiveNoUpsell.length > 0) {
    patterns.push({
      patternId: 'long-positive-no-upsell',
      patternName: 'Long Positive Calls With No Upsell Attempt',
      description: 'Engaged customers in long conversations but no upsell was attempted',
      count: longPositiveNoUpsell.length,
      affectedCallIds: longPositiveNoUpsell.map(c => c.id),
      severity: 'high',
      estimatedRevenueImpact: longPositiveNoUpsell.length * 200
    });
  }

  // Pattern 3: Price objection not handled (inferred from sentiment + outcome)
  const priceObjectionNotHandled = calls.filter(c => 
    c.sentiment === 'negative' &&
    c.outcome === 'no_action' &&
    c.duration > 180 // At least 3 minutes
  );
  if (priceObjectionNotHandled.length > 0) {
    patterns.push({
      patternId: 'price-objection-not-handled',
      patternName: 'Price Objection Not Handled',
      description: 'Negative sentiment calls ending with no action, likely price objections',
      count: priceObjectionNotHandled.length,
      affectedCallIds: priceObjectionNotHandled.map(c => c.id),
      severity: 'medium',
      estimatedRevenueImpact: priceObjectionNotHandled.length * 300
    });
  }

  // Pattern 4: Inspection booked but no plan framing
  const inspectionNoPlanFraming = calls.filter(c => 
    c.outcome === 'inspection' &&
    !c.recurringPlan &&
    !c.termiteInspectionUpsold
  );
  if (inspectionNoPlanFraming.length > 0) {
    patterns.push({
      patternId: 'inspection-no-plan-framing',
      patternName: 'Inspection Booked But No Plan Framing',
      description: 'Inspections scheduled without discussing recurring plan benefits',
      count: inspectionNoPlanFraming.length,
      affectedCallIds: inspectionNoPlanFraming.map(c => c.id),
      severity: 'medium',
      estimatedRevenueImpact: inspectionNoPlanFraming.length * 150
    });
  }

  // Pattern 5: Customer expressed interest but no termite inspection offered
  const interestNoTermite = calls.filter(c => 
    c.sentiment === 'positive' &&
    c.recurringPlan &&
    !c.termiteInspectionUpsold
  );
  if (interestNoTermite.length > 0) {
    patterns.push({
      patternId: 'interest-no-termite',
      patternName: 'Customer Expressed Interest But No Termite Inspection Offered',
      description: 'Recurring plans sold but free termite inspection not mentioned',
      count: interestNoTermite.length,
      affectedCallIds: interestNoTermite.map(c => c.id),
      severity: 'high',
      estimatedRevenueImpact: interestNoTermite.length * 200
    });
  }

  // Pattern 6: Upsell attempted but no counter-offer after objection
  const upsellNoCounter = calls.filter(c => 
    c.upsellAttempted &&
    !c.upsellSuccess &&
    c.outcome === 'no_action' &&
    c.duration > 300 // At least 5 minutes
  );
  if (upsellNoCounter.length > 0) {
    patterns.push({
      patternId: 'upsell-no-counter',
      patternName: 'Upsell Attempted But No Counter-Offer After Objection',
      description: 'Upsell was attempted but rep didn\'t counter objections',
      count: upsellNoCounter.length,
      affectedCallIds: upsellNoCounter.map(c => c.id),
      severity: 'medium',
      estimatedRevenueImpact: upsellNoCounter.length * 250
    });
  }

  return patterns.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity] || b.count - a.count;
  });
}

