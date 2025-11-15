import { FilterParams } from '../types/shared';

interface GlobalFiltersProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  agents: string[];
}

export function GlobalFilters({ filters, onFilterChange, agents }: GlobalFiltersProps) {
  const handleAgentChange = (agent: string) => {
    onFilterChange({ ...filters, agent: agent === 'all' ? undefined : agent });
  };

  const handleSentimentChange = (sentiment: string) => {
    onFilterChange({ 
      ...filters, 
      sentiment: sentiment === 'all' ? undefined : sentiment as any 
    });
  };

  const handleCallTypeChange = (callType: string) => {
    onFilterChange({ 
      ...filters, 
      callType: callType === 'all' ? undefined : callType as any 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => onFilterChange({})}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Agent Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agent
          </label>
          <select
            value={filters.agent || 'all'}
            onChange={(e) => handleAgentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Agents</option>
            {agents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>

        {/* Sentiment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sentiment
          </label>
          <select
            value={filters.sentiment || 'all'}
            onChange={(e) => handleSentimentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        {/* Call Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Type
          </label>
          <select
            value={filters.callType || 'all'}
            onChange={(e) => handleCallTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </div>
      </div>
    </div>
  );
}

