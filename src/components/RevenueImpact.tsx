import { useState, useEffect } from 'react';
import { FilterParams } from '../types/shared';

interface RevenueAssumptions {
  avgRecurringPlanValue: number;
  avgTermiteUpsellValue: number;
  avgCustomerLifetimeValue: number;
  inspectionConversionRate: number;
}

interface RevenueImpact {
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

interface RevenueImpactProps {
  filters?: FilterParams;
}

export function RevenueImpact({ filters = {} }: RevenueImpactProps) {
  const [revenueImpact, setRevenueImpact] = useState<RevenueImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [assumptions, setAssumptions] = useState<RevenueAssumptions>({
    avgRecurringPlanValue: 150,
    avgTermiteUpsellValue: 200,
    avgCustomerLifetimeValue: 1800,
    inspectionConversionRate: 0.92
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchRevenueImpact() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.agent) params.append('agent', filters.agent);
        if (filters.sentiment) params.append('sentiment', filters.sentiment);
        if (filters.callType) params.append('callType', filters.callType);
        
        // Add assumptions to params
        params.append('avgRecurringPlanValue', assumptions.avgRecurringPlanValue.toString());
        params.append('avgTermiteUpsellValue', assumptions.avgTermiteUpsellValue.toString());
        params.append('avgCustomerLifetimeValue', assumptions.avgCustomerLifetimeValue.toString());
        params.append('inspectionConversionRate', assumptions.inspectionConversionRate.toString());

        const response = await fetch(`/api/revenue-impact?${params}`);
        if (!response.ok) return;
        const text = await response.text();
        if (!text || text.trim() === '') return;
        const data = JSON.parse(text);
        setRevenueImpact(data);
      } catch (err) {
        console.error('Error fetching revenue impact:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRevenueImpact();
  }, [filters, assumptions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Calculating revenue impact...</p>
        </div>
      </div>
    );
  }

  if (!revenueImpact) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Impact Analysis</h2>
          <p className="text-gray-600 mt-1">Estimated monthly revenue loss from missed opportunities</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
        >
          {isEditing ? 'Save Assumptions' : 'Edit Assumptions'}
        </button>
      </div>

      {/* Assumptions Panel */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Revenue Assumptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avg Recurring Plan Value ($/month)
              </label>
              <input
                type="number"
                value={assumptions.avgRecurringPlanValue}
                onChange={(e) => setAssumptions({ ...assumptions, avgRecurringPlanValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avg Termite Upsell Value ($)
              </label>
              <input
                type="number"
                value={assumptions.avgTermiteUpsellValue}
                onChange={(e) => setAssumptions({ ...assumptions, avgTermiteUpsellValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avg Customer Lifetime Value ($)
              </label>
              <input
                type="number"
                value={assumptions.avgCustomerLifetimeValue}
                onChange={(e) => setAssumptions({ ...assumptions, avgCustomerLifetimeValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Conversion Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={(assumptions.inspectionConversionRate * 100).toFixed(0)}
                onChange={(e) => setAssumptions({ ...assumptions, inspectionConversionRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Revenue Loss Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Missed Follow-ups */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-800">Missed Follow-ups</h3>
            <span className="text-2xl">📞</span>
          </div>
          <p className="text-3xl font-bold text-red-900 mb-1">
            {formatCurrency(revenueImpact.missedFollowUps.estimatedMonthlyLoss)}
          </p>
          <p className="text-xs text-red-700 mb-2">/month</p>
          <p className="text-xs text-gray-600">{revenueImpact.missedFollowUps.description}</p>
        </div>

        {/* Missed Upsells */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-orange-800">Missed Upsells</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-orange-900 mb-1">
            {formatCurrency(revenueImpact.missedUpsells.estimatedMonthlyLoss)}
          </p>
          <p className="text-xs text-orange-700 mb-2">/month</p>
          <p className="text-xs text-gray-600">{revenueImpact.missedUpsells.description}</p>
        </div>

        {/* Lost Inspections */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-yellow-800">Lost Inspections</h3>
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900 mb-1">
            {formatCurrency(revenueImpact.lostInspections.estimatedMonthlyLoss)}
          </p>
          <p className="text-xs text-yellow-700 mb-2">/month</p>
          <p className="text-xs text-gray-600">{revenueImpact.lostInspections.description}</p>
        </div>

        {/* Price Objections */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-800">Price Objections</h3>
            <span className="text-2xl">💸</span>
          </div>
          <p className="text-3xl font-bold text-purple-900 mb-1">
            {formatCurrency(revenueImpact.priceObjections.estimatedMonthlyLoss)}
          </p>
          <p className="text-xs text-purple-700 mb-2">/month</p>
          <p className="text-xs text-gray-600">{revenueImpact.priceObjections.description}</p>
        </div>
      </div>

      {/* Total Loss */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Total Estimated Monthly Revenue Loss</p>
            <p className="text-4xl font-bold">{formatCurrency(revenueImpact.totalEstimatedMonthlyLoss)}</p>
            <p className="text-sm opacity-75 mt-1">
              Annual impact: {formatCurrency(revenueImpact.totalEstimatedMonthlyLoss * 12)}
            </p>
          </div>
          <div className="text-6xl opacity-50">⚠️</div>
        </div>
      </div>
    </div>
  );
}

