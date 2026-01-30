import { useState, useEffect, useCallback } from 'react';
import { Textarea, Button } from '../ui';

const MOODS = [
  { 
    value: 'great', 
    label: 'Great',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-green-400 bg-green-500/20 border-green-500/30'
  },
  { 
    value: 'good', 
    label: 'Good',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
  },
  { 
    value: 'okay', 
    label: 'Okay',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
  },
  { 
    value: 'bad', 
    label: 'Bad',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30'
  },
  { 
    value: 'terrible', 
    label: 'Terrible',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-red-400 bg-red-500/20 border-red-500/30'
  },
];

export default function JournalEditor({
  entry,
  onSave,
  saving = false,
  autoSave = true,
  autoSaveDelay = 2000,
}) {
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || null);
  const [tags, setTags] = useState(entry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Reset state when entry changes (date change)
  useEffect(() => {
    setContent(entry?.content || '');
    setMood(entry?.mood || null);
    setTags(entry?.tags || []);
    setHasChanges(false);
    setLastSaved(entry?.updatedAt ? new Date(entry.updatedAt) : null);
  }, [entry?.date]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [content, mood, tags, hasChanges, autoSave, autoSaveDelay]);

  const handleSave = useCallback(async () => {
    if (!hasChanges && !entry?.isNew) return;
    
    try {
      await onSave({ content, mood, tags });
      setHasChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save journal:', error);
    }
  }, [content, mood, tags, hasChanges, entry?.isNew, onSave]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleMoodChange = (newMood) => {
    setMood(mood === newMood ? null : newMood);
    setHasChanges(true);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
      setHasChanges(true);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setHasChanges(true);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Mood selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          How are you feeling today?
        </label>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleMoodChange(m.value)}
              className={`flex flex-col items-center p-3 rounded-lg transition-all border ${
                mood === m.value
                  ? `${m.color} ring-2 ring-primary-500`
                  : 'bg-surface-800/50 border-surface-700 text-gray-400 hover:border-surface-600'
              }`}
              title={m.label}
            >
              {m.icon}
              <span className="text-xs mt-1">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            What&apos;s on your mind?
          </label>
          <span className="text-xs text-gray-500">{wordCount} words</span>
        </div>
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Write about your day, your thoughts, what you learned..."
          rows={12}
          className="font-serif"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-surface-700/50 border border-surface-600 rounded-full text-sm text-gray-300"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-500 hover:text-gray-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag..."
            maxLength={30}
            className="input flex-1"
          />
          <Button variant="secondary" onClick={handleAddTag} disabled={!tagInput.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* Save status */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-700">
        <div className="text-sm text-gray-500">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Saving...
            </span>
          ) : hasChanges ? (
            <span className="text-amber-400">Unsaved changes</span>
          ) : lastSaved ? (
            <span>Saved at {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Start writing...</span>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving || (!hasChanges && !entry?.isNew)}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
