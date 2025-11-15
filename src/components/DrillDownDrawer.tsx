import { useState, useEffect } from 'react';

interface CallDetail {
  callId: string;
  agentName: string;
  outcome: string;
  upsellAttempted: boolean;
  upsellSuccess: boolean;
  followUpRequested: boolean;
  sentiment: string;
  durationMinutes: number;
  date: string;
  customerName: string;
}

interface DrillDownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  title: string;
  filters?: { agent?: string; sentiment?: string; callType?: string };
}

export function DrillDownDrawer({ isOpen, onClose, category, title, filters = {} }: DrillDownDrawerProps) {
  const [calls, setCalls] = useState<CallDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      setLoading(true);
      const params = new URLSearchParams({
        category,
        ...(filters.agent && { agent: filters.agent }),
        ...(filters.sentiment && { sentiment: filters.sentiment }),
        ...(filters.callType && { callType: filters.callType }),
        ...((filters as any).patternId && { patternId: (filters as any).patternId })
      });

      fetch(`/api/calls/category?${params}`)
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
          setCalls(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching call details:', err);
          setLoading(false);
        });
    }
  }, [isOpen, category, filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading call details...</p>
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No calls found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Call ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upsell</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Follow-up</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sentiment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calls.map((call) => (
                      <tr key={call.callId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{call.callId.substring(0, 8)}...</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{call.agentName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{call.customerName}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            call.outcome === 'sale' ? 'bg-green-100 text-green-800' :
                            call.outcome === 'inspection' ? 'bg-blue-100 text-blue-800' :
                            call.outcome === 'follow_up' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {call.outcome}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {call.upsellAttempted ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              call.upsellSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {call.upsellSuccess ? '✓ Success' : '✗ Failed'}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {call.followUpRequested ? (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            call.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            call.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {call.sentiment}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{call.durationMinutes.toFixed(1)}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total: {calls.length} calls</span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

