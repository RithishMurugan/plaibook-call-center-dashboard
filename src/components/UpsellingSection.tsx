import { useState } from 'react';
import { UpsellingMetrics } from '../types/analytics';
import { FilterParams } from '../types/shared';
import { MetricCard } from './MetricCard';
import { DrillDownDrawer } from './DrillDownDrawer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface UpsellingSectionProps {
  metrics: UpsellingMetrics;
  filters?: FilterParams;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export function UpsellingSection({ metrics, filters = {} }: UpsellingSectionProps) {
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);

  const chartData = [
    { name: 'Termite Inspections Upsold', value: metrics.termiteInspectionUpsold },
    { name: 'Recurring Plans Sold', value: metrics.totalRecurringPlans },
    { name: 'Missed Opportunities', value: metrics.opportunitiesMissed }
  ];

  const successData = [
    { name: 'Successful Upsells', value: metrics.termiteInspectionUpsold },
    { name: 'Missed Opportunities', value: metrics.opportunitiesMissed }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upselling Performance</h2>
        <p className="text-gray-600 mb-6">
          Track how effectively reps are upselling free termite inspections with recurring plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Recurring Plans Sold"
          value={metrics.totalRecurringPlans}
          subtitle="Total plans"
        />
        <MetricCard
          title="Termite Inspections Upsold"
          value={metrics.termiteInspectionUpsold}
          subtitle="With recurring plans"
        />
        <MetricCard
          title="Upsell Success Rate"
          value={`${metrics.upsellSuccessRate.toFixed(1)}%`}
          subtitle={metrics.upsellSuccessRate > 50 ? 'trending up' : 'needs improvement'}
          trend={metrics.upsellSuccessRate > 50 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upselling Breakdown</h3>
            <button
              onClick={() => setDrillDownCategory('upsell')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Details →
            </button>
          </div>
          <div className="cursor-pointer" onClick={() => setDrillDownCategory('upsell')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success vs Missed Opportunities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={successData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {successData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {metrics.opportunitiesMissed > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Alert:</strong> {metrics.opportunitiesMissed} missed upselling opportunities detected. 
            Consider additional training on termite inspection upsells.
          </p>
        </div>
      )}

      <DrillDownDrawer
        isOpen={drillDownCategory === 'upsell'}
        onClose={() => setDrillDownCategory(null)}
        category="upsell"
        title="Upselling Breakdown - Call Details"
        filters={filters}
      />
    </div>
  );
}

