import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { qnaApi } from '../services/qnaApi';
import { QuestionCard } from '../components/qna';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'votes', label: 'Top Voted' },
  { value: 'unanswered', label: 'Unanswered' },
  { value: 'active', label: 'Active' },
];

export default function QAPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [questionsRes, tagsRes] = await Promise.all([
          qnaApi.searchQuestions({ q: query, tag, sortBy, page }),
          qnaApi.getTags(10),
        ]);

        setQuestions(questionsRes.questions);
        setPagination(questionsRes.pagination);
        setTags(tagsRes.data);
      } catch (err) {
        console.error('Error loading Q&A:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [query, tag, sortBy, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const q = formData.get('search');
    setSearchParams((prev) => {
      if (q) {
        prev.set('q', q);
      } else {
        prev.delete('q');
      }
      prev.delete('page');
      return prev;
    });
  };

  const handleTagClick = (tagName) => {
    setSearchParams((prev) => {
      if (prev.get('tag') === tagName) {
        prev.delete('tag');
      } else {
        prev.set('tag', tagName);
      }
      prev.delete('page');
      return prev;
    });
  };

  const handleSortChange = (newSort) => {
    setSearchParams((prev) => {
      prev.set('sortBy', newSort);
      prev.delete('page');
      return prev;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      prev.set('page', newPage);
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVote = (questionId, newScore) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === questionId ? { ...q, voteScore: newScore } : q
      )
    );
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (loading && questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-700 rounded w-48 mb-4"></div>
            <div className="h-12 bg-surface-700 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-32 bg-surface-800"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Q&A Community</h1>
            <p className="text-gray-400 mt-1">
              Ask questions, share knowledge, and learn together
            </p>
          </div>
          {user && (
            <Link to="/qa/ask" className="btn-primary whitespace-nowrap">
              Ask Question
            </Link>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              name="search"
              defaultValue={query}
              placeholder="Search questions..."
              className="input pl-10 w-full"
            />
          </div>
        </form>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Sort */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-700 text-gray-300 hover:bg-surface-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Active Filters */}
          {(query || tag) && (
            <div className="flex items-center gap-2 ml-auto">
              {tag && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-900/30 text-primary-400 rounded-full text-sm">
                  tag: {tag}
                  <button
                    onClick={() => handleTagClick(tag)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {query && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-700 text-gray-300 rounded-full text-sm">
                  "{query}"
                  <button
                    onClick={() =>
                      setSearchParams((prev) => {
                        prev.delete('q');
                        return prev;
                      })
                    }
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Popular Tags */}
        {tags.length > 0 && !tag && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => handleTagClick(t.tag)}
                  className="px-3 py-1 bg-surface-700 text-gray-300 text-sm rounded-lg hover:bg-surface-600 transition-colors"
                >
                  {t.tag} <span className="text-gray-500">×{t.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card bg-red-900/20 text-red-400 text-center mb-6">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Info */}
        {pagination && (
          <p className="text-sm text-gray-400 mb-4">
            {pagination.total} question{pagination.total !== 1 ? 's' : ''}
            {tag && ` tagged "${tag}"`}
            {query && ` matching "${query}"`}
          </p>
        )}

        {/* Questions List */}
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                onVote={handleVote}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="card text-center py-12">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 mb-4">No questions found</p>
              {(query || tag) && (
                <button
                  onClick={clearFilters}
                  className="text-primary-400 hover:underline"
                >
                  Clear filters
                </button>
              )}
              {user && !query && !tag && (
                <Link
                  to="/qa/ask"
                  className="btn-primary inline-block mt-4"
                >
                  Be the first to ask!
                </Link>
              )}
            </div>
          )
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-700 hover:bg-surface-600 text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.pages}
              className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
