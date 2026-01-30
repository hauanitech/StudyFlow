import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from '../ui';

export default function NewChatModal({ isOpen, onClose, friends, onCreateDirect, onCreateGroup }) {
  const [mode, setMode] = useState('direct'); // 'direct' or 'group'
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = useCallback(() => {
    setMode('direct');
    setGroupName('');
    setSelectedFriends([]);
    onClose();
  }, [onClose]);

  const toggleFriendSelection = useCallback((friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  }, []);

  const handleCreateDirect = useCallback(async (friendId) => {
    setIsCreating(true);
    try {
      await onCreateDirect(friendId);
      handleClose();
    } finally {
      setIsCreating(false);
    }
  }, [onCreateDirect, handleClose]);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return;
    
    setIsCreating(true);
    try {
      await onCreateGroup(groupName.trim(), selectedFriends);
      handleClose();
    } finally {
      setIsCreating(false);
    }
  }, [groupName, selectedFriends, onCreateGroup, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-xl card shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-700">
            <h2 className="text-lg font-semibold text-white">New Chat</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex border-b border-surface-700">
            <button
              onClick={() => setMode('direct')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'direct'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Direct Message
            </button>
            <button
              onClick={() => setMode('group')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'group'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Group Chat
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Add some friends first to start chatting!
              </p>
            ) : mode === 'direct' ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-3">
                  Select a friend to start chatting
                </p>
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleCreateDirect(friend.id)}
                    disabled={isCreating}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-700/50 transition-colors disabled:opacity-50"
                  >
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.displayName || friend.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-900/30 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-400">
                          {(friend.displayName || friend.username || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-medium text-white">
                        {friend.displayName || friend.username}
                      </p>
                      <p className="text-sm text-gray-400">
                        @{friend.username}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Group Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Members selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Members ({selectedFriends.length} selected)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {friends.map((friend) => (
                      <label
                        key={friend.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedFriends.includes(friend.id)
                            ? 'bg-primary-900/20'
                            : 'hover:bg-surface-700/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => toggleFriendSelection(friend.id)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        {friend.avatarUrl ? (
                          <img
                            src={friend.avatarUrl}
                            alt={friend.displayName || friend.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-900/30 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary-400">
                              {(friend.displayName || friend.username || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-white">
                          {friend.displayName || friend.username}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Create button */}
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedFriends.length === 0 || isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

NewChatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  friends: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  })).isRequired,
  onCreateDirect: PropTypes.func.isRequired,
  onCreateGroup: PropTypes.func.isRequired,
};
