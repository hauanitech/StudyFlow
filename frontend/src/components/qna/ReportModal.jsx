import { useState } from 'react';
import { qnaApi } from '../../services/qnaApi';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({ targetType, targetId, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await qnaApi.createReport({
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-surface-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Report Content</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Help us understand the issue with this content
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Why are you reporting this?
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 border border-surface-600 rounded-lg hover:bg-surface-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide any additional context that might help..."
              className="input w-full resize-none"
              maxLength={1000}
            />
            <p className="text-gray-400 text-xs mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason}
              className="btn-primary flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
