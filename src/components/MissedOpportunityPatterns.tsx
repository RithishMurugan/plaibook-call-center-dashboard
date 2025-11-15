import { useState, useEffect } from 'react';
import { MissedOpportunityPattern } from '../types/shared';
import { DrillDownDrawer } from './DrillDownDrawer';
import { FilterParams } from '../types/shared';

interface MissedOpportunityPatternsProps {
  filters?: FilterParams;
}

export function MissedOpportunityPatterns({ filters = {} }: MissedOpportunityPatternsProps) {
  const [patterns, setPatterns] = useState<MissedOpportunityPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.agent) params.append('agent', filters.agent);
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
    if (filters.callType) params.append('callType', filters.callType);

    fetch(`/api/missed-opportunity-patterns?${params}`)
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
      .then(data => {
        setPatterns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching patterns:', err);
        setLoading(false);
      });
  }, [filters]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Missed Opportunity Patterns</h3>
        <p className="text-gray-600 mb-6">
          Rule-based analysis identifying patterns where opportunities were missed
        </p>

        <div className="space-y-4">
          {patterns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No missed opportunity patterns detected</p>
          ) : (
            patterns.map((pattern) => (
              <div
                key={pattern.patternId}
                className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${getSeverityColor(pattern.severity)}`}
                onClick={() => setSelectedPattern(pattern.patternId)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{pattern.patternName}</h4>
                    <p className="text-sm opacity-90 mb-2">{pattern.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold">{pattern.count}</div>
                    <div className="text-xs opacity-75">calls affected</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-current border-opacity-20">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pattern.severity === 'high' ? 'bg-red-200' :
                    pattern.severity === 'medium' ? 'bg-yellow-200' :
                    'bg-blue-200'
                  }`}>
                    {pattern.severity.toUpperCase()} Priority
                  </span>
                  {pattern.estimatedRevenueImpact && (
                    <span className="text-sm font-semibold">
                      Est. Impact: {formatCurrency(pattern.estimatedRevenueImpact)}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs opacity-75">
                  Click to view affected calls
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedPattern && (
        <DrillDownDrawer
          isOpen={!!selectedPattern}
          onClose={() => setSelectedPattern(null)}
          category="pattern"
          title={`Calls Affected: ${patterns.find(p => p.patternId === selectedPattern)?.patternName}`}
          filters={{ ...filters, patternId: selectedPattern } as any}
        />
      )}
    </>
  );
}

