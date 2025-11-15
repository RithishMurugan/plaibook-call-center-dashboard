import { CallRecord, NatesViewMetrics, MissedOpportunityPattern } from '../types/index';
import { analyzeUpselling } from '../analysis';
import { analyzeFollowUps } from '../analysis';
import { analyzeSales } from '../analysis';
import { detectMissedOpportunityPatterns } from './patterns';

export function generateNatesViewMetrics(calls: CallRecord[]): NatesViewMetrics {
  const upselling = analyzeUpselling(calls);
  const followUps = analyzeFollowUps(calls);
  const sales = analyzeSales(calls);
  const patterns = detectMissedOpportunityPatterns(calls);

  // Card 1: Termite attachment
  const attachmentRate = upselling.totalRecurringPlans > 0
    ? (upselling.termiteInspectionUpsold / upselling.totalRecurringPlans) * 100
    : 0;
  
  let termiteInsight = '';
  if (attachmentRate >= 80) {
    termiteInsight = 'Excellent! Reps are consistently attaching termite inspections to recurring plans.';
  } else if (attachmentRate >= 60) {
    termiteInsight = 'Good attachment rate, but there\'s room to improve. Consider training on the value proposition.';
  } else {
    termiteInsight = 'Low attachment rate detected. This is a significant opportunity - termite inspections can double account value.';
  }

  // Card 2: Follow-up capture
  const completionRate = followUps.totalFollowUps > 0
    ? (followUps.followUpsActedOn / followUps.totalFollowUps) * 100
    : 0;

  let followUpInsight = '';
  if (completionRate >= 80) {
    followUpInsight = 'Strong follow-up execution. Hot leads are being captured and acted upon effectively.';
  } else if (completionRate >= 60) {
    followUpInsight = 'Moderate follow-up completion. Some hot leads may be slipping through - consider improving task tracking.';
  } else {
    followUpInsight = 'Critical issue: Many follow-up requests are not being acted upon. These are hot leads dying on the vine!';
  }

  // Card 3: Sales vs Inspections
  let salesInsight = '';
  if (sales.totalSales > sales.totalInspections) {
    salesInsight = `Strong immediate sales focus (${sales.totalSales} sales vs ${sales.totalInspections} inspections). Both are valuable - sales provide immediate revenue while inspections are strategic pipeline builders with 92% conversion potential.`;
  } else {
    salesInsight = `Strategic pipeline building (${sales.totalInspections} inspections vs ${sales.totalSales} sales). Inspections convert at 92% to recurring services - this is excellent pipeline development.`;
  }

  // Card 4: Unknown unknowns
  const topPatterns = patterns.slice(0, 3).map(p => ({
    pattern: p.patternName,
    count: p.count
  }));

  let unknownInsight = '';
  if (topPatterns.length > 0) {
    const totalAffected = topPatterns.reduce((sum, p) => sum + p.count, 0);
    unknownInsight = `Pattern analysis revealed ${topPatterns.length} key opportunity patterns affecting ${totalAffected} calls. Top issue: ${topPatterns[0].pattern} (${topPatterns[0].count} calls).`;
  } else {
    unknownInsight = 'No significant missed opportunity patterns detected. Great job!';
  }

  return {
    termiteAttachment: {
      attachmentRate: Math.round(attachmentRate * 10) / 10,
      recurringPlans: upselling.totalRecurringPlans,
      inspectionsAttached: upselling.termiteInspectionUpsold,
      insight: termiteInsight
    },
    followUpCapture: {
      totalFollowUps: followUps.totalFollowUps,
      actedOn: followUps.followUpsActedOn,
      completionRate: Math.round(completionRate * 10) / 10,
      insight: followUpInsight
    },
    salesVsInspections: {
      sales: sales.totalSales,
      inspections: sales.totalInspections,
      salesRate: Math.round(sales.salesRate * 10) / 10,
      inspectionRate: Math.round(sales.inspectionRate * 10) / 10,
      insight: salesInsight
    },
    unknownUnknowns: {
      topPatterns,
      insight: unknownInsight
    }
  };
}

