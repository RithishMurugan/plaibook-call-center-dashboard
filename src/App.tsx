import { useEffect, useState } from 'react';
import { Analytics } from './types/analytics';
import { FilterParams, NatesViewMetrics } from './types/shared';
import { NatesView } from './components/NatesView';
import { GlobalFilters } from './components/GlobalFilters';
import { UpsellingSection } from './components/UpsellingSection';
import { FollowUpSection } from './components/FollowUpSection';
import { SalesSection } from './components/SalesSection';
import { InsightsSection } from './components/InsightsSection';
import { RevenueImpact } from './components/RevenueImpact';
import { MissedOpportunityPatterns } from './components/MissedOpportunityPatterns';
import { RepCoaching } from './components/RepCoaching';
import { FunnelViews } from './components/FunnelViews';
import { LLMInsights } from './components/LLMInsights';

function App() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [natesView, setNatesView] = useState<NatesViewMetrics | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});
  const [agents, setAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load agents list
  useEffect(() => {
    fetch('/api/calls')
      .then(async res => {
        if (!res.ok) return [];
        const text = await res.text();
        if (!text || text.trim() === '') return [];
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(calls => {
        if (Array.isArray(calls)) {
          const uniqueAgents = Array.from(new Set(calls.map((c: any) => c.agentName)));
          setAgents(uniqueAgents.sort());
        }
      })
      .catch(console.error);
  }, []);

  // Load analytics with filters
  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.agent) params.append('agent', filters.agent);
        if (filters.sentiment) params.append('sentiment', filters.sentiment);
        if (filters.callType) params.append('callType', filters.callType);

        const [analyticsData, natesViewData] = await Promise.all([
          fetch(`/api/analytics?${params}`).then(async res => {
            if (!res.ok) throw new Error(`Analytics: ${res.status}`);
            const text = await res.text();
            if (!text || text.trim() === '') throw new Error('Empty response');
            return JSON.parse(text);
          }),
          fetch(`/api/nates-view?${params}`).then(async res => {
            if (!res.ok) throw new Error(`Nates View: ${res.status}`);
            const text = await res.text();
            if (!text || text.trim() === '') throw new Error('Empty response');
            return JSON.parse(text);
          })
        ]);

        setAnalytics(analyticsData);
        setNatesView(natesViewData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Example Pest Control - Call Center Dashboard</h1>
          <p className="mt-2 text-gray-600">Deep insights into call center performance and opportunities</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Nate's View - Top Section */}
          {natesView && <NatesView metrics={natesView} />}

          {/* Global Filters */}
          <GlobalFilters 
            filters={filters} 
            onFilterChange={setFilters}
            agents={agents}
          />

          {/* Existing Sections with Drill-down Support */}
          <UpsellingSection metrics={analytics.upselling} filters={filters} />
          <FollowUpSection metrics={analytics.followUps} filters={filters} />
          <SalesSection metrics={analytics.sales} filters={filters} />
          
          {/* Funnel Views */}
          <FunnelViews filters={filters} />

          {/* Additional Insights */}
          <InsightsSection insights={analytics.insights} />

          {/* Revenue Impact */}
          <RevenueImpact filters={filters} />
          
          {/* Missed Opportunity Patterns */}
          <MissedOpportunityPatterns filters={filters} />

          {/* Rep Coaching */}
          <RepCoaching filters={filters} />

          {/* LLM Insights */}
          <LLMInsights />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Dashboard for Nate, Head of Sales at Example Pest Control
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
