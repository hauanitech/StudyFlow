import { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '../ui';

export default function UserSearch({ onSendRequest, searchUsers, isLoading }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);
  const containerRef = useRef(null);

  // Search users with debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await searchUsers(query);
        setResults(users);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, searchUsers]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendRequest = useCallback(async (userId) => {
    await onSendRequest(userId);
    // Remove user from results or update their status
    setResults(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, hasPendingRequest: true, pendingRequestDirection: 'sent' }
        : user
    ));
  }, [onSendRequest]);

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder="Search users by username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        className="w-full"
      />

      {/* Search Results Dropdown */}
      {showResults && (query.length >= 2) && (
        <div className="absolute z-10 w-full mt-2 bg-surface-800 rounded-lg shadow-lg border border-surface-700 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <div className="divide-y divide-surface-600">
              {results.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-surface-700/50">
                  {/* Avatar */}
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName || user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-400">
                        {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {user.displayName || user.username}
                    </p>
                    <p className="text-sm text-gray-400">
                      @{user.username}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {user.isFriend ? (
                      <span className="text-sm text-gray-500">Already friends</span>
                    ) : user.hasPendingRequest ? (
                      <span className="text-sm text-amber-400">
                        {user.pendingRequestDirection === 'sent' ? 'Request sent' : 'Request received'}
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendRequest(user.id)}
                        disabled={isLoading}
                      >
                        Add Friend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

UserSearch.propTypes = {
  onSendRequest: PropTypes.func.isRequired,
  searchUsers: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
