import { useState } from 'react';
import { FollowUpMetrics } from '../types/analytics';
import { FilterParams } from '../types/shared';
import { MetricCard } from './MetricCard';
import { DrillDownDrawer } from './DrillDownDrawer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface FollowUpSectionProps {
  metrics: FollowUpMetrics;
  filters?: FilterParams;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function FollowUpSection({ metrics, filters = {} }: FollowUpSectionProps) {
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);
  
  const followUpReasons = Object.entries(metrics.followUpsByReason).map(([reason, count]) => ({
    reason,
    count
  }));

  const actionData = [
    { name: 'Follow-ups Acted On', value: metrics.followUpsActedOn },
    { name: 'Pending Follow-ups', value: metrics.totalFollowUps - metrics.followUpsActedOn }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Follow-up Opportunities</h2>
        <p className="text-gray-600 mb-6">
          Monitor follow-up requests and ensure they're being captured and acted upon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Follow-ups"
          value={metrics.totalFollowUps}
          subtitle="Requests captured"
        />
        <MetricCard
          title="Follow-up Rate"
          value={`${metrics.followUpRate.toFixed(1)}%`}
          subtitle="Of all calls"
        />
        <MetricCard
          title="Follow-ups Acted On"
          value={metrics.followUpsActedOn}
          subtitle={`${metrics.totalFollowUps > 0 ? ((metrics.followUpsActedOn / metrics.totalFollowUps) * 100).toFixed(0) : 0}% completion`}
          trend={metrics.followUpsActedOn / metrics.totalFollowUps > 0.6 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Follow-up Reasons</h3>
            <button
              onClick={() => setDrillDownCategory('followup')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Details →
            </button>
          </div>
          <div className="cursor-pointer" onClick={() => setDrillDownCategory('followup')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={followUpReasons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="reason" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Action Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {actionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {followUpReasons.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Follow-up Reasons</h3>
          <div className="space-y-2">
            {followUpReasons.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">{item.reason}</span>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DrillDownDrawer
        isOpen={drillDownCategory === 'followup'}
        onClose={() => setDrillDownCategory(null)}
        category="followup"
        title="Follow-up Opportunities - Call Details"
        filters={filters}
      />
    </div>
  );
}

