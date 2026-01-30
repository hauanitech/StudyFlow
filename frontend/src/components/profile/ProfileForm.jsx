import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Textarea } from '../ui';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
  { value: 'friends', label: 'Friends Only', description: 'Only friends can view your profile' },
  { value: 'private', label: 'Private', description: 'Only you can view your profile' },
];

export default function ProfileForm({ profile, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    avatarUrl: profile?.avatarUrl || '',
    visibility: profile?.visibility || 'public',
    studyGoals: profile?.studyGoals || '',
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};

    if (formData.displayName && formData.displayName.length > 50) {
      newErrors.displayName = 'Display name must be 50 characters or less';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    if (formData.avatarUrl && formData.avatarUrl.length > 0) {
      try {
        new URL(formData.avatarUrl);
      } catch {
        newErrors.avatarUrl = 'Please enter a valid URL';
      }
    }

    if (formData.studyGoals && formData.studyGoals.length > 200) {
      newErrors.studyGoals = 'Study goals must be 200 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await onSave(formData);
      setIsDirty(false);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save profile' });
    }
  }, [formData, validate, onSave]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar URL */}
      <div>
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300 mb-1">
          Avatar URL
        </label>
        <div className="flex items-start gap-4">
          {formData.avatarUrl && (
            <img 
              src={formData.avatarUrl} 
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-surface-600"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div className="flex-1">
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatarUrl}
              onChange={(e) => handleChange('avatarUrl', e.target.value)}
              error={errors.avatarUrl}
            />
            <p className="mt-1 text-xs text-gray-500">Direct link to an image (recommended: 200x200px)</p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
          Display Name
        </label>
        <Input
          id="displayName"
          type="text"
          placeholder="How should others see your name?"
          value={formData.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          error={errors.displayName}
          maxLength={50}
        />
        <p className="mt-1 text-xs text-gray-500">{formData.displayName.length}/50 characters</p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
          Bio
        </label>
        <Textarea
          id="bio"
          placeholder="Tell others about yourself..."
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          error={errors.bio}
          rows={4}
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500 characters</p>
      </div>

      {/* Study Goals */}
      <div>
        <label htmlFor="studyGoals" className="block text-sm font-medium text-gray-300 mb-1">
          Study Goals
        </label>
        <Textarea
          id="studyGoals"
          placeholder="What are you currently studying or working towards?"
          value={formData.studyGoals}
          onChange={(e) => handleChange('studyGoals', e.target.value)}
          error={errors.studyGoals}
          rows={2}
          maxLength={200}
        />
        <p className="mt-1 text-xs text-gray-500">{formData.studyGoals.length}/200 characters</p>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Profile Visibility
        </label>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map(option => (
            <label 
              key={option.value}
              className={`
                flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                ${formData.visibility === option.value 
                  ? 'border-primary-500 bg-primary-900/20' 
                  : 'border-surface-600 hover:bg-surface-700'}
              `}
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={formData.visibility === option.value}
                onChange={(e) => handleChange('visibility', e.target.value)}
                className="mt-0.5 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-white">
                  {option.label}
                </span>
                <span className="block text-xs text-gray-400">
                  {option.description}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-1">
          Timezone
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => handleChange('timezone', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-surface-600 bg-surface-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {Intl.supportedValuesOf('timeZone').map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {errors.submit && (
        <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-700">
        <p className="text-sm text-gray-500">
          {isDirty ? 'You have unsaved changes' : 'All changes saved'}
        </p>
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

ProfileForm.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string,
    bio: PropTypes.string,
    avatarUrl: PropTypes.string,
    visibility: PropTypes.oneOf(['public', 'friends', 'private']),
    studyGoals: PropTypes.string,
    timezone: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
};
