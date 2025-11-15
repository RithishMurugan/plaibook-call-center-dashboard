import { useState } from 'react';
import { SalesMetrics } from '../types/analytics';
import { FilterParams } from '../types/shared';
import { MetricCard } from './MetricCard';
import { DrillDownDrawer } from './DrillDownDrawer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SalesSectionProps {
  metrics: SalesMetrics;
  filters?: FilterParams;
}

export function SalesSection({ metrics, filters = {} }: SalesSectionProps) {
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);
  
  // Combine agent data for comparison
  const agentData = Object.keys({ ...metrics.salesByAgent, ...metrics.inspectionsByAgent }).map(agent => ({
    agent,
    sales: metrics.salesByAgent[agent] || 0,
    inspections: metrics.inspectionsByAgent[agent] || 0
  }));

  const outcomeData = [
    { name: 'Sales', value: metrics.totalSales, rate: metrics.salesRate },
    { name: 'Inspections', value: metrics.totalInspections, rate: metrics.inspectionRate }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales vs Inspections</h2>
        <p className="text-gray-600 mb-6">
          Distinguish between closed sales and inspection bookings to understand agent performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value={metrics.totalSales}
          subtitle="Closed deals"
        />
        <MetricCard
          title="Total Inspections"
          value={metrics.totalInspections}
          subtitle="Bookings only"
        />
        <MetricCard
          title="Sales Rate"
          value={`${metrics.salesRate.toFixed(1)}%`}
          subtitle="Of all calls"
        />
        <MetricCard
          title="Inspection Rate"
          value={`${metrics.inspectionRate.toFixed(1)}%`}
          subtitle="Of all calls"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales vs Inspections Comparison</h3>
            <button
              onClick={() => setDrillDownCategory('sales')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Details →
            </button>
          </div>
          <div className="cursor-pointer" onClick={() => setDrillDownCategory('sales')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={outcomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance by Agent</h3>
            <button
              onClick={() => setDrillDownCategory('agent-performance')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Details →
            </button>
          </div>
          <div className="cursor-pointer" onClick={() => setDrillDownCategory('agent-performance')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#10b981" name="Sales" />
                <Bar dataKey="inspections" fill="#f59e0b" name="Inspections" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="ml-3">
            <h4 className="font-bold text-green-900 mb-2">Strategic Insight: Inspection Bookings</h4>
            <p className="text-green-800 mb-2">
              <strong>Sales</strong> represent closed recurring plans (immediate revenue). 
              <strong> Inspections</strong> are strategic bookings that convert at <strong className="text-green-900">92% to recurring services</strong> later.
            </p>
            <p className="text-sm text-green-700">
              Both are wins, but require different approaches. Inspections are high-value pipeline builders - 
              track them separately and nurture them for maximum conversion.
            </p>
          </div>
        </div>
      </div>

      <DrillDownDrawer
        isOpen={drillDownCategory === 'sales' || drillDownCategory === 'inspections'}
        onClose={() => setDrillDownCategory(null)}
        category={drillDownCategory === 'sales' ? 'sales' : drillDownCategory === 'inspections' ? 'inspections' : 'agent-performance'}
        title={drillDownCategory === 'sales' ? 'Sales - Call Details' : drillDownCategory === 'inspections' ? 'Inspections - Call Details' : 'Agent Performance - Call Details'}
        filters={filters}
      />
    </div>
  );
}

