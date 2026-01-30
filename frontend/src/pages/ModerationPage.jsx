import { useState, useEffect } from 'react';
import { useAuthStore } from '../state/authStore';
import { moderationApi } from '../services/qnaApi';
import { ReportCard } from '../components/moderation';

export default function ModerationPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ total: 0, byType: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Check if user is moderator
  const isModerator = user?.role === 'moderator';

  useEffect(() => {
    if (!isModerator) return;
    fetchData();
  }, [isModerator, filter, page]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportsRes, countsRes] = await Promise.all([
        moderationApi.getPendingReports({
          page,
          targetType: filter !== 'all' ? filter : undefined,
        }),
        moderationApi.getReportCounts(),
      ]);

      setReports(reportsRes.reports);
      setPagination(reportsRes.pagination);
      setCounts(countsRes.data);
    } catch (err) {
      console.error('Error loading reports:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to access this page');
      } else {
        setError('Failed to load reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId, resolution, notes) => {
    try {
      await moderationApi.resolveReport(reportId, resolution, notes);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      setCounts((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('Failed to resolve report');
    }
  };

  const handleDismiss = async (reportId, notes) => {
    try {
      await moderationApi.dismissReport(reportId, notes);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      setCounts((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      console.error('Error dismissing report:', err);
      alert('Failed to dismiss report');
    }
  };

  if (!isModerator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center">
            <p className="text-4xl mb-4">🔒</p>
            <h1 className="text-2xl font-bold mb-2 text-white">Access Restricted</h1>
            <p className="text-gray-400">
              This page is only accessible to moderators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && reports.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-surface-700 rounded w-64 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-40 bg-surface-800"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-red-900/20 text-red-400 text-center">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">🛡️ Moderation Queue</h1>
          <p className="text-gray-400">
            Review and take action on reported content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`card text-center transition-colors ${
              filter === 'all' ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <p className="text-2xl font-bold text-primary-400">{counts.total}</p>
            <p className="text-sm text-gray-500">Total Pending</p>
          </button>
          <button
            onClick={() => {
              setFilter('question');
              setPage(1);
            }}
            className={`card text-center transition-colors ${
              filter === 'question' ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <p className="text-2xl font-bold text-blue-400">
              {counts.byType?.question || 0}
            </p>
            <p className="text-sm text-gray-500">Questions</p>
          </button>
          <button
            onClick={() => {
              setFilter('answer');
              setPage(1);
            }}
            className={`card text-center transition-colors ${
              filter === 'answer' ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <p className="text-2xl font-bold text-green-400">
              {counts.byType?.answer || 0}
            </p>
            <p className="text-sm text-gray-500">Answers</p>
          </button>
          <button
            onClick={() => {
              setFilter('user');
              setPage(1);
            }}
            className={`card text-center transition-colors ${
              filter === 'user' ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <p className="text-2xl font-bold text-purple-400">
              {counts.byType?.user || 0}
            </p>
            <p className="text-sm text-gray-500">Users</p>
          </button>
          <button
            onClick={() => {
              setFilter('chat_message');
              setPage(1);
            }}
            className={`card text-center transition-colors ${
              filter === 'chat_message' ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <p className="text-2xl font-bold text-orange-400">
              {counts.byType?.chat_message || 0}
            </p>
            <p className="text-sm text-gray-500">Messages</p>
          </button>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onResolve={handleResolve}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-gray-400">
              {filter === 'all'
                ? 'No pending reports. Great job!'
                : `No pending ${filter} reports`}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-300 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.pages}
              className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-300 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
