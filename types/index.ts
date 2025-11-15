// Shared TypeScript models for backend and frontend

export interface CallRecord {
  id: string;
  agentName: string;
  customerName: string;
  date: string;
  duration: number; // in seconds
  transcript: string;
  outcome: 'sale' | 'inspection' | 'no_action' | 'follow_up';
  recurringPlan: boolean;
  termiteInspectionUpsold: boolean;
  followUpRequested: boolean;
  followUpReason?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  callType: 'inbound' | 'outbound';
  upsellAttempted?: boolean;
  upsellSuccess?: boolean;
  objections?: string[];
  priceObjection?: boolean;
  inspectionBooked?: boolean;
  planFramed?: boolean;
}

export interface UpsellMetrics {
  totalRecurringPlans: number;
  termiteInspectionUpsold: number;
  upsellSuccessRate: number;
  opportunitiesMissed: number;
  attachmentRate: number; // % of recurring plans with termite inspection
}

export interface FollowUpMetrics {
  totalFollowUps: number;
  followUpsByReason: Record<string, number>;
  followUpRate: number;
  followUpsActedOn: number;
  followUpCompletionRate: number;
}

export interface SalesInspectionMetrics {
  totalSales: number;
  totalInspections: number;
  salesRate: number;
  inspectionRate: number;
  salesByAgent: Record<string, number>;
  inspectionsByAgent: Record<string, number>;
  avgSalesDuration: number;
  avgInspectionDuration: number;
}

export interface MissedOpportunityPattern {
  patternId: string;
  patternName: string;
  description: string;
  count: number;
  affectedCallIds: string[];
  severity: 'high' | 'medium' | 'low';
  estimatedRevenueImpact?: number;
}

export interface RepCoachingSuggestion {
  agentName: string;
  suggestions: Array<{
    category: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    metrics: Record<string, number>;
  }>;
}

export interface LLMCallInsight {
  callId: string;
  upsellAttempted: boolean;
  upsellAttachedToRecurring: boolean;
  saleOutcome: 'sale' | 'inspection' | 'no_action' | 'follow_up';
  followUpRequested: boolean;
  followUpPhrase?: string;
  objections: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keyMoments: Array<{
    timestamp: string;
    speaker: 'agent' | 'customer';
    quote: string;
    significance: string;
  }>;
  customerIntent: string;
  repPerformance: {
    strengths: string[];
    weaknesses: string[];
  };
}

export interface FilterParams {
  agent?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'all';
  callType?: 'inbound' | 'outbound' | 'all';
}

export interface SalesFunnelMetrics {
  totalCalls: number;
  pitchesMade: number;
  objectionsEncountered: number;
  recurringPlansSold: number;
  successRate: number;
  avgDuration: number;
  agentPerformance: Record<string, {
    calls: number;
    sales: number;
    successRate: number;
  }>;
}

export interface InspectionFunnelMetrics {
  totalCalls: number;
  inspectionsBooked: number;
  bookingRate: number;
  predictedConversions: number; // 92% of inspections
  avgDuration: number;
  agentStrengths: Record<string, {
    inspections: number;
    bookingRate: number;
  }>;
  typicalObjections: Array<{
    objection: string;
    count: number;
  }>;
}

export interface NatesViewMetrics {
  termiteAttachment: {
    attachmentRate: number;
    recurringPlans: number;
    inspectionsAttached: number;
    insight: string;
  };
  followUpCapture: {
    totalFollowUps: number;
    actedOn: number;
    completionRate: number;
    insight: string;
  };
  salesVsInspections: {
    sales: number;
    inspections: number;
    salesRate: number;
    inspectionRate: number;
    insight: string;
  };
  unknownUnknowns: {
    topPatterns: Array<{
      pattern: string;
      count: number;
    }>;
    insight: string;
  };
}

