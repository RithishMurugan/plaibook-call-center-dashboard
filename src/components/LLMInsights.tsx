import { useState, useEffect } from 'react';
import { LLMCallInsight } from '../types/shared';

export function LLMInsights() {
  const [insights, setInsights] = useState<LLMCallInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    fetch('/api/llm-insights?limit=0') // Limit to 0 to get cached insights only
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        // Check if response has content
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return [];
        }
        return res.text().then(text => {
          if (!text || text.trim() === '') {
            return [];
          }
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error('JSON parse error:', e, 'Response text:', text.substring(0, 100));
            return [];
          }
        });
      })
      .then(data => {
        setInsights(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching LLM insights:', err);
        setInsights([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading LLM insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">LLM-Powered Transcript Analysis (Demo)</h3>
      <p className="text-gray-600 mb-6">
        <strong>Demo Feature:</strong> AI-extracted insights from a small subset of calls (5-10) to show Nate what's possible with LLM analysis.
        All 451 calls use fast heuristics for the main dashboard metrics.
      </p>

      {insights.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <p className="text-blue-800 mb-2">
              <strong>Gemini 2.5 LLM Integration Ready</strong>
            </p>
            <p className="text-sm text-blue-600 mb-4">
              <strong>Demo Feature:</strong> LLM analysis is shown for a small subset (5-10 calls) to demonstrate capabilities.
              All 451 calls use fast heuristics for the main dashboard.
              {insights.length === 0 && ' Click below to generate demo insights.'}
            </p>
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  const response = await fetch('/api/llm-insights/analyze', { method: 'POST' });
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const data = await response.json();
                  alert(`Demo analysis started for ${data.count} calls. This will take ~10-20 seconds.`);
                  // Reload insights after a delay
                  setTimeout(() => {
                    fetch('/api/llm-insights')
                      .then(res => {
                        if (!res.ok) return [];
                        return res.text().then(text => {
                          if (!text || text.trim() === '') return [];
                          try {
                            return JSON.parse(text);
                          } catch {
                            return [];
                          }
                        });
                      })
                      .then(data => {
                        setInsights(Array.isArray(data) ? data : []);
                        setLoading(false);
                      })
                      .catch(() => {
                        setInsights([]);
                        setLoading(false);
                      });
                  }, 15000); // Wait 15 seconds for analysis
                } catch (err) {
                  alert('Error starting analysis. Make sure GEMINI_API_KEY is set in service/.env');
                  setLoading(false);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Demo LLM Insights (5-10 calls)
            </button>
          </div>
          <div className="text-xs text-blue-600 mt-4">
            <p><strong>Setup Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Get your Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
              <li>Create <code>service/.env</code> file with: <code>GEMINI_API_KEY=your_key_here</code></li>
              <li>Restart the backend server</li>
              <li>Click "Analyze Transcripts" above</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {insights.map((insight) => (
            <div key={insight.callId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Call {insight.callId.substring(0, 8)}</h4>
                  <p className="text-sm text-gray-600">Intent: {insight.customerIntent}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    insight.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    insight.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {insight.sentiment}
                  </span>
                </div>
              </div>

              {insight.followUpPhrase && (
                <div className="mb-3 p-2 bg-yellow-50 rounded">
                  <p className="text-xs text-gray-600 mb-1">Follow-up Phrase:</p>
                  <p className="text-sm font-medium text-yellow-800">"{insight.followUpPhrase}"</p>
                </div>
              )}

              {insight.objections.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Objections:</p>
                  <div className="flex flex-wrap gap-2">
                    {insight.objections.map((obj, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {insight.keyMoments.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Key Moments:</p>
                  <div className="space-y-1">
                    {insight.keyMoments.map((moment, idx) => (
                      <div key={idx} className="text-xs p-2 bg-gray-50 rounded">
                        <span className="font-medium">{moment.timestamp}</span> -{' '}
                        <span className={moment.speaker === 'agent' ? 'text-blue-600' : 'text-green-600'}>
                          {moment.speaker}
                        </span>
                        : "{moment.quote}" - {moment.significance}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                {insight.repPerformance.strengths.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Strengths:</p>
                    <ul className="text-xs space-y-1">
                      {insight.repPerformance.strengths.map((s, idx) => (
                        <li key={idx} className="text-green-700">✓ {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {insight.repPerformance.weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Areas for Improvement:</p>
                    <ul className="text-xs space-y-1">
                      {insight.repPerformance.weaknesses.map((w, idx) => (
                        <li key={idx} className="text-red-700">✗ {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

