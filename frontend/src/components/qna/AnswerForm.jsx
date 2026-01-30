import { useState } from 'react';
import { useAuthStore } from '../../state/authStore';

export default function AnswerForm({ onSubmit }) {
  const { user } = useAuthStore();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (body.trim().length < 20) {
      setError('Your answer must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(body.trim());
      setBody('');
    } catch (err) {
      setError(err.message || 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="card text-center">
        <p className="text-gray-400 mb-4">
          You need to be logged in to answer this question
        </p>
        <a href="/login" className="btn-primary">
          Log In
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Answer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Write your answer here... Be detailed and helpful!"
            className={`input w-full resize-y ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <p className="text-gray-400 text-sm mt-1">
            {body.length}/10000 characters (minimum 20)
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || body.trim().length < 20}
            className="btn-primary"
          >
            {submitting ? 'Posting...' : 'Post Your Answer'}
          </button>
        </div>
      </form>
    </div>
  );
}
