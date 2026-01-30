import { useState } from 'react';

const RESOLUTION_OPTIONS = [
  { value: 'warning_issued', label: 'Issue Warning', color: 'yellow' },
  { value: 'content_removed', label: 'Remove Content', color: 'red' },
  { value: 'user_banned', label: 'Ban User', color: 'red' },
  { value: 'no_action', label: 'No Action Needed', color: 'gray' },
];

export default function ReportCard({ report, onResolve, onDismiss }) {
  const [showContent, setShowContent] = useState(false);
  const [resolution, setResolution] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReasonLabel = (reason) => {
    const labels = {
      spam: 'Spam',
      harassment: 'Harassment',
      hate_speech: 'Hate Speech',
      inappropriate: 'Inappropriate',
      misinformation: 'Misinformation',
      copyright: 'Copyright',
      other: 'Other',
    };
    return labels[reason] || reason;
  };

  const getTargetTypeLabel = (type) => {
    const labels = {
      question: 'Question',
      answer: 'Answer',
      user: 'User',
      chat_message: 'Chat Message',
    };
    return labels[type] || type;
  };

  const handleResolve = async () => {
    if (!resolution) return;
    setProcessing(true);
    try {
      await onResolve(report._id, resolution, notes);
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = async () => {
    setProcessing(true);
    try {
      await onDismiss(report._id, notes);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="card border-l-4 border-l-yellow-500">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{getTargetTypeLabel(report.targetType)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{getReasonLabel(report.reason)}</span>
          </div>
          <p className="text-sm text-gray-500">
            Reported by <span className="text-primary-400">{report.reporter?.username}</span>
            <span className="mx-2">•</span>
            {formatDate(report.createdAt)}
          </p>
        </div>
        <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 text-sm rounded-full">
          Pending Review
        </span>
      </div>

      {/* Description */}
      {report.description && (
        <div className="bg-surface-700 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-300">{report.description}</p>
        </div>
      )}

      {/* Reported Content Preview */}
      {report.targetContent && (
        <div className="mb-4">
          <button
            onClick={() => setShowContent(!showContent)}
            className="text-sm text-primary-400 hover:underline"
          >
            {showContent ? '▼ Hide reported content' : '▶ Show reported content'}
          </button>
          {showContent && (
            <div className="mt-2 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              {report.targetType === 'question' && (
                <>
                  <p className="font-medium mb-2 text-white">{report.targetContent.title}</p>
                  <p className="text-sm text-gray-400 line-clamp-4">
                    {report.targetContent.body}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    By: {report.targetContent.author?.username}
                  </p>
                </>
              )}
              {report.targetType === 'answer' && (
                <>
                  <p className="text-xs text-gray-500 mb-1">
                    Answer to: {report.targetContent.question?.title}
                  </p>
                  <p className="text-sm text-gray-400 line-clamp-4">
                    {report.targetContent.body}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    By: {report.targetContent.author?.username}
                  </p>
                </>
              )}
              {report.targetType === 'user' && (
                <p className="text-sm text-gray-300">
                  Username: <strong className="text-white">{report.targetContent.username}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="border-t pt-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Resolution Select */}
          <div className="flex-1">
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="input w-full"
            >
              <option value="">Select action...</option>
              {RESOLUTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleResolve}
            disabled={!resolution || processing}
            className="btn-primary flex-1"
          >
            {processing ? 'Processing...' : 'Take Action'}
          </button>
          <button
            onClick={handleDismiss}
            disabled={processing}
            className="btn-secondary flex-1"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
