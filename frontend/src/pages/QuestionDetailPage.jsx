import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { qnaApi } from '../services/qnaApi';
import { AnswerList, AnswerForm, ReportModal } from '../components/qna';import logger from '../utils/logger';
export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = user && question?.author?._id === user.id;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [questionRes, answersRes] = await Promise.all([
          qnaApi.getQuestion(questionId),
          qnaApi.getAnswers(questionId),
        ]);

        setQuestion(questionRes.data);
        setAnswers(answersRes.data);
        setEditTitle(questionRes.data.title);
        setEditBody(questionRes.data.body);
      } catch (err) {
        console.error('Error loading question:', err);
        if (err.response?.status === 404) {
          setError('Question not found');
        } else {
          setError('Failed to load question');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [questionId]);

  const handleVoteQuestion = async (value) => {
    if (!user || voting) return;
    setVoting(true);
    try {
      const result = await qnaApi.voteQuestion(questionId, value);
      setQuestion((prev) => ({
        ...prev,
        voteScore: result.data.newScore,
        userVote: prev.userVote === value ? 0 : value,
      }));
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleVoteAnswer = (answerId, newScore, value) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a._id === answerId
          ? { ...a, voteScore: newScore, userVote: a.userVote === value ? 0 : value }
          : a
      )
    );
  };

  const handleAcceptAnswer = async (answerId, accept) => {
    try {
      if (accept) {
        await qnaApi.acceptAnswer(answerId);
        setAnswers((prev) =>
          prev.map((a) => ({
            ...a,
            isAccepted: a._id === answerId,
          }))
        );
        setQuestion((prev) => ({ ...prev, acceptedAnswer: answerId }));
      } else {
        await qnaApi.unacceptAnswer(questionId);
        setAnswers((prev) =>
          prev.map((a) => ({ ...a, isAccepted: false }))
        );
        setQuestion((prev) => ({ ...prev, acceptedAnswer: null }));
      }
    } catch (error) {
      console.error('Accept answer error:', error);
    }
  };

  const handleEditAnswer = async (answerId, body) => {
    try {
      await qnaApi.updateAnswer(answerId, body);
      setAnswers((prev) =>
        prev.map((a) => (a._id === answerId ? { ...a, body } : a))
      );
    } catch (error) {
      console.error('Edit answer error:', error);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!confirm('Are you sure you want to delete this answer?')) return;
    try {
      await qnaApi.deleteAnswer(answerId);
      setAnswers((prev) => prev.filter((a) => a._id !== answerId));
    } catch (error) {
      console.error('Delete answer error:', error);
    }
  };

  const handleCreateAnswer = async (body) => {
    const response = await qnaApi.createAnswer(questionId, body);
    setAnswers((prev) => [...prev, response.data]);
    setQuestion((prev) => ({
      ...prev,
      answerCount: prev.answerCount + 1,
    }));
  };

  const handleSaveQuestion = async () => {
    if (editTitle.trim().length < 10 || editBody.trim().length < 20) return;
    setSaving(true);
    try {
      await qnaApi.updateQuestion(questionId, {
        title: editTitle.trim(),
        body: editBody.trim(),
      });
      setQuestion((prev) => ({
        ...prev,
        title: editTitle.trim(),
        body: editBody.trim(),
      }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      await qnaApi.deleteQuestion(questionId);
      navigate('/qa');
    } catch (error) {
      console.error('Delete question error:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-surface-700 rounded w-1/4 mb-8"></div>
            <div className="card">
              <div className="space-y-4">
                <div className="h-4 bg-surface-700 rounded"></div>
                <div className="h-4 bg-surface-700 rounded"></div>
                <div className="h-4 bg-surface-700 rounded w-2/3"></div>
              </div>
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
          <div className="card text-center">
            <p className="text-gray-400 mb-4">{error}</p>
            <Link to="/qa" className="btn-primary">
              Back to Q&A
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link to="/qa" className="text-primary-400 hover:underline text-sm">
            ← Back to Q&A
          </Link>
        </div>

        {/* Question */}
        <div className="card mb-8">
          <div className="flex gap-4">
            {/* Vote Column */}
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <button
                onClick={() => handleVoteQuestion(1)}
                disabled={!user || voting || isAuthor}
                className={`p-2 rounded hover:bg-surface-700 transition-colors text-xl ${
                  question.userVote === 1 ? 'text-primary-400' : 'text-gray-400'
                } ${isAuthor ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ▲
              </button>
              <span
                className={`font-bold text-xl ${
                  question.voteScore > 0
                    ? 'text-green-400'
                    : question.voteScore < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {question.voteScore}
              </span>
              <button
                onClick={() => handleVoteQuestion(-1)}
                disabled={!user || voting || isAuthor}
                className={`p-2 rounded hover:bg-surface-700 transition-colors text-xl ${
                  question.userVote === -1 ? 'text-red-400' : 'text-gray-400'
                } ${isAuthor ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ▼
              </button>
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input w-full text-xl font-bold"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                    className="input w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveQuestion}
                      disabled={saving}
                      className="btn-primary"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditTitle(question.title);
                        setEditBody(question.body);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-4">{question.title}</h1>

                  <div className="prose max-w-none mb-6">
                    {question.body.split('\n').map((paragraph, i) => (
                      <p key={i} className="text-gray-300 mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/qa?tag=${tag}`}
                        className="px-3 py-1 bg-primary-900/50 text-primary-400 text-sm rounded-lg hover:bg-primary-800/50 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-700">
                    <div className="flex gap-4 text-sm">
                      {isAuthor && (
                        <>
                          <button
                            onClick={() => setEditing(true)}
                            className="text-gray-500 hover:text-primary-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-gray-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {user && !isAuthor && (
                        <button
                          onClick={() =>
                            setReportTarget({ type: 'question', id: questionId })
                          }
                          className="text-gray-500 hover:text-red-400"
                        >
                          Report
                        </button>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      <span>{question.viewCount} views</span>
                      <span className="mx-2">•</span>
                      <span>
                        asked {formatDate(question.createdAt)} by{' '}
                        <span className="text-primary-400">
                          {question.author?.username}
                        </span>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Answers */}
        {answers.length > 0 && (
          <AnswerList
            answers={answers}
            questionAuthorId={question.author?._id}
            onVote={handleVoteAnswer}
            onAccept={handleAcceptAnswer}
            onEdit={handleEditAnswer}
            onDelete={handleDeleteAnswer}
            onReport={(answerId) =>
              setReportTarget({ type: 'answer', id: answerId })
            }
          />
        )}

        {/* Answer Form */}
        {question.status === 'open' && (
          <AnswerForm onSubmit={handleCreateAnswer} />
        )}

        {question.status === 'closed' && (
          <div className="card text-center mt-8">
            <p className="text-gray-400">
              This question has been closed and is no longer accepting answers.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Reason: {question.closedReason}
            </p>
          </div>
        )}

        {/* Report Modal */}
        {reportTarget && (
          <ReportModal
            targetType={reportTarget.type}
            targetId={reportTarget.id}
            onClose={() => setReportTarget(null)}
            onSuccess={() => alert('Report submitted. Thank you!')}
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Delete Question?</h3>
              <p className="text-gray-400 mb-6">
                This will permanently delete your question and all its answers.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
