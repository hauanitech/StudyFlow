import { useState } from 'react';
import { useAuthStore } from '../../state/authStore';
import { qnaApi } from '../../services/qnaApi';

function AnswerItem({
  answer,
  questionAuthorId,
  onVote,
  onAccept,
  onEdit,
  onDelete,
  onReport,
}) {
  const { user } = useAuthStore();
  const [voting, setVoting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const [saving, setSaving] = useState(false);

  const isAuthor = user && answer.author._id === user.id;
  const isQuestionAuthor = user && questionAuthorId === user.id;

  const handleVote = async (value) => {
    if (!user || voting) return;
    setVoting(true);
    try {
      const result = await qnaApi.voteAnswer(answer._id, value);
      onVote(answer._id, result.data.newScore, value);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editBody.trim().length < 20) return;
    setSaving(true);
    try {
      await onEdit(answer._id, editBody.trim());
      setEditing(false);
    } finally {
      setSaving(false);
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

  return (
    <div
      className={`p-4 border-b border-surface-700 last:border-b-0 ${
        answer.isAccepted ? 'bg-green-900/20 border-l-4 border-l-green-500' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 min-w-[50px]">
          <button
            onClick={() => handleVote(1)}
            disabled={!user || voting || isAuthor}
            className={`p-1 rounded hover:bg-surface-700 transition-colors ${
              answer.userVote === 1 ? 'text-primary-400' : 'text-gray-400'
            } ${isAuthor ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ▲
          </button>
          <span
            className={`font-bold text-sm ${
              answer.voteScore > 0
                ? 'text-green-400'
                : answer.voteScore < 0
                ? 'text-red-400'
                : 'text-gray-400'
            }`}
          >
            {answer.voteScore}
          </span>
          <button
            onClick={() => handleVote(-1)}
            disabled={!user || voting || isAuthor}
            className={`p-1 rounded hover:bg-surface-700 transition-colors ${
              answer.userVote === -1 ? 'text-red-400' : 'text-gray-400'
            } ${isAuthor ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ▼
          </button>

          {/* Accept button */}
          {isQuestionAuthor && (
            <button
              onClick={() => onAccept(answer._id, !answer.isAccepted)}
              className={`mt-2 text-2xl transition-colors ${
                answer.isAccepted
                  ? 'text-green-500'
                  : 'text-gray-300 hover:text-green-500'
              }`}
              title={answer.isAccepted ? 'Unaccept answer' : 'Accept answer'}
            >
              ✓
            </button>
          )}

          {/* Non-owner accepted badge */}
          {!isQuestionAuthor && answer.isAccepted && (
            <span className="mt-2 text-2xl text-green-500" title="Accepted answer">
              ✓
            </span>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
                className="input w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || editBody.trim().length < 20}
                  className="btn-primary text-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditBody(answer.body);
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="prose max-w-none mb-4">
                {answer.body.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-300 mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
                <div className="flex gap-4">
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="hover:text-primary-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(answer._id)}
                        className="hover:text-red-400"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {user && !isAuthor && (
                    <button
                      onClick={() => onReport(answer._id)}
                      className="hover:text-red-400"
                    >
                      Report
                    </button>
                  )}
                </div>

                <div className="bg-surface-700 px-3 py-2 rounded">
                  answered {formatDate(answer.createdAt)} by{' '}
                  <span className="text-primary-400">{answer.author?.username}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnswerList({
  answers,
  questionAuthorId,
  onVote,
  onAccept,
  onEdit,
  onDelete,
  onReport,
}) {
  const [sortBy, setSortBy] = useState('votes');

  const sortedAnswers = [...answers].sort((a, b) => {
    // Always put accepted answer first
    if (a.isAccepted !== b.isAccepted) {
      return a.isAccepted ? -1 : 1;
    }

    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'votes':
      default:
        return b.voteScore - a.voteScore;
    }
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input py-1 px-2 text-sm"
          >
            <option value="votes">Highest score</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Answers */}
      <div className="card p-0 overflow-hidden">
        {sortedAnswers.map((answer) => (
          <AnswerItem
            key={answer._id}
            answer={answer}
            questionAuthorId={questionAuthorId}
            onVote={onVote}
            onAccept={onAccept}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
          />
        ))}
      </div>
    </div>
  );
}
