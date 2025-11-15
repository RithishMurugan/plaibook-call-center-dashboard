import { AdditionalInsights } from '../types/analytics';
import { MetricCard } from './MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

interface InsightsSectionProps {
  insights: AdditionalInsights;
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444'];

export function InsightsSection({ insights }: InsightsSectionProps) {
  const sentimentData = Object.entries(insights.sentimentBreakdown).map(([sentiment, count]) => ({
    sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    count
  }));

  const callTypeData = Object.entries(insights.callTypeBreakdown).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }));

  const conversionData = Object.entries(insights.conversionRateBySentiment).map(([sentiment, rate]) => ({
    sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    rate: Number(rate.toFixed(1))
  }));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Critical Insights & Revenue Opportunities</h2>
        <p className="text-gray-600 mb-6">
          Discover valuable patterns and opportunities that might not be immediately obvious - including "unknown unknowns" that could be costing you money.
        </p>
      </div>

      {/* CRITICAL: Follow-up Leakage Alert */}
      {insights.followUpLeakage && insights.followUpLeakage.notActedOn > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">🚨 CRITICAL: Hot Leads Dying</h3>
              <p className="text-red-800 mb-3">
                <strong>{insights.followUpLeakage.notActedOn}</strong> follow-up requests are NOT being acted upon. 
                These are hot leads that requested callbacks - they're dying on the vine!
              </p>
              <div className="bg-white rounded p-4 mt-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Estimated Lost Revenue:</strong> {formatCurrency(insights.followUpLeakage.estimatedLostRevenue)}/year
                </p>
                <p className="text-xs text-gray-600">
                  Based on 92% conversion rate for follow-ups → recurring services
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGIC: Inspection Conversion Potential */}
      {insights.inspectionConversionPotential && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-900 mb-3">🎯 Strategic Win: Inspection Bookings</h3>
          <p className="text-green-800 mb-4">
            You have <strong>{insights.inspectionConversionPotential.totalInspections}</strong> inspection bookings. 
            These are strategic wins - <strong>92% convert to recurring services</strong> later!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold text-green-700">{insights.inspectionConversionPotential.totalInspections}</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-600">Estimated Future Sales</p>
              <p className="text-2xl font-bold text-green-700">{insights.inspectionConversionPotential.estimatedFutureSales}</p>
              <p className="text-xs text-gray-500">(92% conversion)</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-600">Potential Revenue</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(insights.inspectionConversionPotential.estimatedRevenue)}</p>
              <p className="text-xs text-gray-500">Annual</p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Opportunities */}
      {insights.revenueOpportunities && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-600">Missed Termite Upsells</p>
              <p className="text-2xl font-bold text-yellow-700">{insights.revenueOpportunities.missedTermiteUpsells}</p>
              <p className="text-xs text-gray-500 mt-1">Potential: {formatCurrency(insights.revenueOpportunities.estimatedUpsellRevenue)}</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-600">Follow-up Revenue Potential</p>
              <p className="text-2xl font-bold text-yellow-700">{formatCurrency(insights.revenueOpportunities.followUpRevenuePotential)}</p>
              <p className="text-xs text-gray-500 mt-1">If all follow-ups converted</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-600">Total Opportunity</p>
              <p className="text-2xl font-bold text-yellow-700">
                {formatCurrency(insights.revenueOpportunities.estimatedUpsellRevenue + insights.revenueOpportunities.followUpRevenuePotential)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Combined potential</p>
            </div>
          </div>
        </div>
      )}

      {/* Agent Follow-up Performance */}
      {insights.agentFollowUpPerformance && insights.agentFollowUpPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Follow-up Performance</h3>
          <p className="text-sm text-gray-600 mb-4">Who's capturing and acting on follow-up opportunities?</p>
          <div className="space-y-3">
            {insights.agentFollowUpPerformance.map((agent, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">{agent.agent}</span>
                  <span className={`text-sm font-bold ${agent.rate > 60 ? 'text-green-600' : agent.rate > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {agent.rate.toFixed(0)}% acted on
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{agent.followUps} follow-ups captured</span>
                  <span>{agent.actedOn} acted on</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${agent.rate > 60 ? 'bg-green-500' : agent.rate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${agent.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-based Patterns */}
      {insights.timeBasedPatterns && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Duration Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Sales Calls</p>
              <p className="text-2xl font-bold text-blue-700">{formatDuration(insights.timeBasedPatterns.averageDurationForSales)}</p>
              <p className="text-xs text-gray-500 mt-1">Average duration</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Inspection Bookings</p>
              <p className="text-2xl font-bold text-green-700">{formatDuration(insights.timeBasedPatterns.averageDurationForInspections)}</p>
              <p className="text-xs text-gray-500 mt-1">Average duration</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded">
              <p className="text-sm text-gray-600">Follow-up Requests</p>
              <p className="text-2xl font-bold text-yellow-700">{formatDuration(insights.timeBasedPatterns.averageDurationForFollowUps)}</p>
              <p className="text-xs text-gray-500 mt-1">Average duration</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Average Call Duration"
          value={formatDuration(insights.averageCallDuration)}
          subtitle="Per call"
        />
        <MetricCard
          title="Top Performing Agent"
          value={insights.topPerformingAgents[0]?.agent || 'N/A'}
          subtitle={`${insights.topPerformingAgents[0]?.sales || 0} sales, ${insights.topPerformingAgents[0]?.upsells || 0} upsells`}
        />
        <MetricCard
          title="Missed Opportunities"
          value={insights.missedOpportunities.length}
          subtitle="Identified"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sentiment, percent }) => `${sentiment}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={callTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate by Sentiment</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={conversionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sentiment" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rate" stroke="#3b82f6" name="Conversion Rate (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
          <div className="space-y-3">
            {insights.topPerformingAgents.map((agent, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold text-gray-900">{agent.agent}</p>
                  <p className="text-sm text-gray-600">{agent.sales} sales, {agent.upsells} upsells</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{agent.sales + agent.upsells}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Missed Opportunities</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {insights.missedOpportunities.length > 0 ? (
              insights.missedOpportunities.map((opp, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Call {opp.callId}:</strong> {opp.opportunity}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No missed opportunities detected. Great job!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

