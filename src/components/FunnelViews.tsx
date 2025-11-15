import { useState, useEffect } from 'react';
import { SalesFunnelMetrics, InspectionFunnelMetrics } from '../types/shared';
import { FilterParams } from '../types/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface FunnelViewsProps {
  filters?: FilterParams;
}

export function FunnelViews({ filters = {} }: FunnelViewsProps) {
  const [activeView, setActiveView] = useState<'sales' | 'inspection'>('sales');
  const [salesFunnel, setSalesFunnel] = useState<SalesFunnelMetrics | null>(null);
  const [inspectionFunnel, setInspectionFunnel] = useState<InspectionFunnelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.agent) params.append('agent', filters.agent);
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
    if (filters.callType) params.append('callType', filters.callType);

    Promise.all([
      fetch(`/api/funnels/sales?${params}`).then(async res => {
        if (!res.ok) return null;
        const text = await res.text();
        if (!text || text.trim() === '') return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      }),
      fetch(`/api/funnels/inspection?${params}`).then(async res => {
        if (!res.ok) return null;
        const text = await res.text();
        if (!text || text.trim() === '') return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
    ])
      .then(([sales, inspection]) => {
        setSalesFunnel(sales);
        setInspectionFunnel(inspection);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching funnels:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading funnel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline Analysis</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('sales')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeView === 'sales'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Phone Sales Pipeline
            </button>
            <button
              onClick={() => setActiveView('inspection')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeView === 'inspection'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Inspection Booking Pipeline
            </button>
          </div>
        </div>

        {activeView === 'sales' && salesFunnel && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-blue-700">{salesFunnel.totalCalls}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Pitches Made</p>
                <p className="text-2xl font-bold text-blue-700">{salesFunnel.pitchesMade}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Objections</p>
                <p className="text-2xl font-bold text-blue-700">{salesFunnel.objectionsEncountered}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Sales Closed</p>
                <p className="text-2xl font-bold text-blue-700">{salesFunnel.recurringPlansSold}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold mb-4">Sales Funnel Flow</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { stage: 'Total Calls', value: salesFunnel.totalCalls },
                  { stage: 'Pitches Made', value: salesFunnel.pitchesMade },
                  { stage: 'Objections', value: salesFunnel.objectionsEncountered },
                  { stage: 'Sales Closed', value: salesFunnel.recurringPlansSold }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold mb-4">Agent Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(salesFunnel.agentPerformance).map(([agent, stats]) => ({
                    agent,
                    successRate: stats.successRate,
                    sales: stats.sales
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
                  <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'inspection' && inspectionFunnel && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-green-700">{inspectionFunnel.totalCalls}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Inspections Booked</p>
                <p className="text-2xl font-bold text-green-700">{inspectionFunnel.inspectionsBooked}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Booking Rate</p>
                <p className="text-2xl font-bold text-green-700">{inspectionFunnel.bookingRate.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Predicted Conversions</p>
                <p className="text-2xl font-bold text-green-700">{inspectionFunnel.predictedConversions}</p>
                <p className="text-xs text-gray-500">(92% of inspections)</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold mb-4">Inspection Booking Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { stage: 'Total Calls', value: inspectionFunnel.totalCalls },
                  { stage: 'Inspections Booked', value: inspectionFunnel.inspectionsBooked },
                  { stage: 'Predicted Sales', value: inspectionFunnel.predictedConversions }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold mb-4">Agent Strengths (Inspection Bookings)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(inspectionFunnel.agentStrengths).map(([agent, stats]) => ({
                    agent,
                    inspections: stats.inspections,
                    bookingRate: stats.bookingRate
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inspections" fill="#10b981" name="Inspections" />
                  <Bar dataKey="bookingRate" fill="#f59e0b" name="Booking Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {inspectionFunnel.typicalObjections.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="text-lg font-semibold mb-4">Typical Objections</h3>
                <div className="space-y-2">
                  {inspectionFunnel.typicalObjections.map((obj, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">{obj.objection}</span>
                      <span className="font-semibold text-gray-900">{obj.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

