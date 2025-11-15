import { CallRecord, FilterParams } from '../types/index';

export function filterCalls(calls: CallRecord[], filters: FilterParams): CallRecord[] {
  let filtered = [...calls];

  if (filters.agent && filters.agent !== 'all') {
    filtered = filtered.filter(c => c.agentName === filters.agent);
  }

  if (filters.sentiment && filters.sentiment !== 'all') {
    filtered = filtered.filter(c => c.sentiment === filters.sentiment);
  }

  if (filters.callType && filters.callType !== 'all') {
    filtered = filtered.filter(c => c.callType === filters.callType);
  }

  return filtered;
}

