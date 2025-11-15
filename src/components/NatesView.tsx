import { NatesViewMetrics } from '../types/shared';

interface NatesViewProps {
  metrics: NatesViewMetrics;
}

export function NatesView({ metrics }: NatesViewProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Nate's View</h2>
        <p className="text-gray-600">Direct answers to your critical business questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Termite Attachment */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Termite Inspection Attachment
            </h3>
            <span className="text-2xl">🔗</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Attachment Rate</span>
              <span className="text-2xl font-bold text-blue-600">
                {metrics.termiteAttachment.attachmentRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recurring Plans</span>
              <span className="text-lg font-semibold">{metrics.termiteAttachment.recurringPlans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inspections Attached</span>
              <span className="text-lg font-semibold">{metrics.termiteAttachment.inspectionsAttached}</span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">{metrics.termiteAttachment.insight}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Follow-up Capture */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Follow-up Opportunities
            </h3>
            <span className="text-2xl">📞</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Follow-ups</span>
              <span className="text-2xl font-bold text-green-600">
                {metrics.followUpCapture.totalFollowUps}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Acted On</span>
              <span className="text-lg font-semibold">{metrics.followUpCapture.actedOn}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="text-lg font-semibold">
                {metrics.followUpCapture.completionRate.toFixed(1)}%
              </span>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded">
              <p className="text-sm text-green-800">{metrics.followUpCapture.insight}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Sales vs Inspections */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Sales vs Inspections
            </h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recurring Plan Sales</span>
              <span className="text-2xl font-bold text-purple-600">
                {metrics.salesVsInspections.sales}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inspection Bookings</span>
              <span className="text-lg font-semibold">{metrics.salesVsInspections.inspections}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-xs text-gray-500">Sales Rate</span>
                <p className="text-sm font-semibold">{metrics.salesVsInspections.salesRate.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Inspection Rate</span>
                <p className="text-sm font-semibold">{metrics.salesVsInspections.inspectionRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded">
              <p className="text-sm text-purple-800">{metrics.salesVsInspections.insight}</p>
            </div>
          </div>
        </div>

        {/* Card 4: Unknown Unknowns */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Unknown Unknowns
            </h3>
            <span className="text-2xl">🔍</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              {metrics.unknownUnknowns.topPatterns.map((pattern, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-gray-700">{pattern.pattern}</span>
                  <span className="text-sm font-bold text-yellow-700">{pattern.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded">
              <p className="text-sm text-yellow-800">{metrics.unknownUnknowns.insight}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

