import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui';
import { ProfileForm, DeleteAccountModal } from '../components/profile';
import profileApi from '../services/profileApi';
import { useAuthStore } from '../state/authStore';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionPreview, setDeletionPreview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const profileData = await profileApi.getMyProfile();
        setProfile(profileData);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Handle profile save
  const handleSave = useCallback(async (updates) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const updatedProfile = await profileApi.updateProfile(updates);
      setProfile(updatedProfile);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Handle delete account click
  const handleDeleteClick = useCallback(async () => {
    try {
      const preview = await profileApi.getDeletionPreview();
      setDeletionPreview(preview);
      setShowDeleteModal(true);
    } catch (err) {
      setError('Failed to load deletion preview');
    }
  }, []);

  // Handle account deletion
  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await profileApi.deleteAccount();
      logout();
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  }, [logout]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-700 rounded w-1/3"></div>
            <div className="h-4 bg-surface-700 rounded w-2/3"></div>
            <div className="h-64 bg-surface-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-1">
            Manage your profile information and privacy settings
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-400">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Account Info Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400">Username</label>
                <p className="text-white font-medium">@{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400">Email</label>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400">Member Since</label>
                <p className="text-white font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400">Role</label>
                <p className="text-white font-medium capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Form Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Profile Details</h2>
            <ProfileForm 
              profile={profile} 
              onSave={handleSave} 
              isSaving={saving}
            />
          </div>
        </Card>

        {/* Stats Card */}
        {profile?.stats && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary-400">
                    {profile.stats.pomodorosCompleted || 0}
                  </p>
                  <p className="text-sm text-gray-400">Pomodoros</p>
                </div>
                <div className="text-center p-4 bg-accent-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-accent-400">
                    {profile.stats.journalEntries || 0}
                  </p>
                  <p className="text-sm text-gray-400">Journal Entries</p>
                </div>
                <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">
                    {profile.stats.questionsAsked || 0}
                  </p>
                  <p className="text-sm text-gray-400">Questions Asked</p>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">
                    {profile.stats.answersGiven || 0}
                  </p>
                  <p className="text-sm text-gray-400">Answers Given</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-red-800">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 text-sm font-medium text-red-400 border border-red-700 rounded-lg hover:bg-red-900/20 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </Card>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        preview={deletionPreview}
        isDeleting={isDeleting}
      />
    </div>
  );
}
