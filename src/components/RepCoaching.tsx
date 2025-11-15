import { useState, useEffect } from 'react';
import { RepCoachingSuggestion } from '../types/shared';
import { FilterParams } from '../types/shared';

interface RepCoachingProps {
  filters?: FilterParams;
}

export function RepCoaching({ filters = {} }: RepCoachingProps) {
  const [suggestions, setSuggestions] = useState<RepCoachingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.agent) params.append('agent', filters.agent);
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
    if (filters.callType) params.append('callType', filters.callType);

    fetch(`/api/rep-coaching?${params}`)
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
        setSuggestions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching coaching suggestions:', err);
        setLoading(false);
      });
  }, [filters]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading coaching suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Rep Coaching Suggestions</h3>
      <p className="text-gray-600 mb-6">
        Personalized coaching recommendations based on performance patterns
      </p>

      <div className="space-y-6">
        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No coaching suggestions at this time</p>
        ) : (
          suggestions.map((rep, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{rep.agentName}</h4>
              <div className="space-y-3">
                {rep.suggestions.map((suggestion, sIdx) => (
                  <div
                    key={sIdx}
                    className={`border-l-4 rounded p-3 ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-600">{suggestion.category}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            suggestion.priority === 'high' ? 'bg-red-200 text-red-800' :
                            suggestion.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {suggestion.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{suggestion.message}</p>
                      </div>
                    </div>
                    {Object.keys(suggestion.metrics).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                        <div className="flex gap-4 text-xs">
                          {Object.entries(suggestion.metrics).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-600">{key}:</span>{' '}
                              <span className="font-semibold">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

