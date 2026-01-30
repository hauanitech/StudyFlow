import { useState } from 'react';
import { useAuthStore } from '../../state/authStore';

export default function QuestionForm({ onSubmit, initialData, isEditing }) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validate = () => {
    const newErrors = {};

    if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }
    if (body.trim().length < 20) {
      newErrors.body = 'Body must be at least 20 characters';
    }
    if (body.length > 10000) {
      newErrors.body = 'Body must be 10000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), body: body.trim(), tags });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="card text-center">
        <p className="text-gray-400 mb-4">
          You need to be logged in to ask a question
        </p>
        <a href="/login" className="btn-primary">
          Log In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title
          <span className="text-gray-400 font-normal ml-2">
            Be specific and imagine you're asking a question to another person
          </span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., How can I improve my focus during long study sessions?"
          className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
        <p className="text-gray-400 text-sm mt-1">
          {title.length}/200 characters
        </p>
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          What are the details of your problem?
          <span className="text-gray-400 font-normal ml-2">
            Include all the information someone would need to answer your question
          </span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder="Describe your question in detail..."
          className={`input w-full resize-y ${errors.body ? 'border-red-500' : ''}`}
        />
        {errors.body && (
          <p className="text-red-500 text-sm mt-1">{errors.body}</p>
        )}
        <p className="text-gray-400 text-sm mt-1">
          {body.length}/10000 characters
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
          <span className="text-gray-400 font-normal ml-2">
            Add up to 5 tags to describe what your question is about
          </span>
        </label>

        {/* Tag display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-900/50 text-primary-400 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag input */}
        {tags.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., study-tips, focus, productivity"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary"
            >
              Add Tag
            </button>
          </div>
        )}
        <p className="text-gray-400 text-sm mt-1">
          {tags.length}/5 tags • Press Enter or comma to add
        </p>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
        >
          {submitting
            ? isEditing
              ? 'Saving...'
              : 'Posting...'
            : isEditing
            ? 'Save Changes'
            : 'Post Your Question'}
        </button>
      </div>
    </form>
  );
}
