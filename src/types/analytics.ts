export interface UpsellingMetrics {
  totalRecurringPlans: number;
  termiteInspectionUpsold: number;
  upsellSuccessRate: number;
  opportunitiesMissed: number;
}

export interface FollowUpMetrics {
  totalFollowUps: number;
  followUpsByReason: Record<string, number>;
  followUpRate: number;
  followUpsActedOn: number;
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
    estimatedLostRevenue: number;
  };
  inspectionConversionPotential: {
    totalInspections: number;
    estimatedFutureSales: number;
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

export interface Analytics {
  upselling: UpsellingMetrics;
  followUps: FollowUpMetrics;
  sales: SalesMetrics;
  insights: AdditionalInsights;
  natesView?: import('./shared').NatesViewMetrics;
}

export interface Call {
  id: string;
  agentName: string;
  customerName: string;
  date: string;
  duration: number;
  transcript: string;
  outcome: 'sale' | 'inspection' | 'no_action' | 'follow_up';
  recurringPlan: boolean;
  termiteInspectionUpsold: boolean;
  followUpRequested: boolean;
  followUpReason?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  callType: 'inbound' | 'outbound';
}

