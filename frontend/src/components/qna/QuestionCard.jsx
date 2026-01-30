import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { qnaApi } from '../../services/qnaApi';

export default function QuestionCard({ question, onVote }) {
  const { user } = useAuthStore();
  const [voting, setVoting] = useState(false);

  const handleVote = async (value) => {
    if (!user || voting) return;
    setVoting(true);
    try {
      const result = await qnaApi.voteQuestion(question._id, value);
      if (onVote) {
        onVote(question._id, result.data.newScore, value);
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 min-w-[60px]">
          <button
            onClick={() => handleVote(1)}
            disabled={!user || voting}
            className={`p-1 rounded hover:bg-surface-700 transition-colors ${
              question.userVote === 1 ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            ▲
          </button>
          <span
            className={`font-bold ${
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
            onClick={() => handleVote(-1)}
            disabled={!user || voting}
            className={`p-1 rounded hover:bg-surface-700 transition-colors ${
              question.userVote === -1 ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            ▼
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/qa/${question._id}`}
            className="block group"
          >
            <h3 className="font-semibold text-lg text-white group-hover:text-primary-400 transition-colors mb-2">
              {question.title}
            </h3>
          </Link>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {question.body}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags.map((tag) => (
              <Link
                key={tag}
                to={`/qa?tag=${tag}`}
                className="px-2 py-1 bg-primary-900/50 text-primary-400 text-xs rounded hover:bg-primary-900/70 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span
              className={`flex items-center gap-1 ${
                question.answerCount > 0
                  ? question.acceptedAnswer
                    ? 'text-green-400 font-medium'
                    : 'text-gray-400'
                  : ''
              }`}
            >
              {question.acceptedAnswer ? '✓' : ''} {question.answerCount}{' '}
              {question.answerCount === 1 ? 'answer' : 'answers'}
            </span>
            <span>{question.viewCount} views</span>
            <span className="ml-auto">
              asked {formatDate(question.createdAt)} by{' '}
              <span className="text-primary-400">{question.author?.username}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
