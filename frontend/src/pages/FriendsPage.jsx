import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui';
import { FriendCard, FriendRequestCard, UserSearch } from '../components/friends';
import friendsApi from '../services/friendsApi';

const TABS = [
  { id: 'friends', label: 'Friends' },
  { id: 'requests', label: 'Requests' },
];

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load friends and requests
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [friendsData, requestsData] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getRequests(),
      ]);

      setFriends(friendsData || []);
      setRequests(requestsData || { received: [], sent: [] });
    } catch (err) {
      setError(err.message || 'Failed to load friends data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle send friend request
  const handleSendRequest = useCallback(async (toUserId) => {
    setActionLoading(true);
    try {
      await friendsApi.sendRequest(toUserId);
      // Reload requests
      const requestsData = await friendsApi.getRequests();
      setRequests(requestsData || { received: [], sent: [] });
    } catch (err) {
      setError(err.message || 'Failed to send friend request');
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Handle accept friend request
  const handleAcceptRequest = useCallback(async (requestId) => {
    setActionLoading(true);
    try {
      await friendsApi.acceptRequest(requestId);
      await loadData(); // Reload all data
    } catch (err) {
      setError(err.message || 'Failed to accept friend request');
    } finally {
      setActionLoading(false);
    }
  }, [loadData]);

  // Handle decline friend request
  const handleDeclineRequest = useCallback(async (requestId) => {
    setActionLoading(true);
    try {
      await friendsApi.declineRequest(requestId);
      setRequests(prev => ({
        ...prev,
        received: prev.received.filter(r => r.id !== requestId),
      }));
    } catch (err) {
      setError(err.message || 'Failed to decline friend request');
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Handle cancel friend request
  const handleCancelRequest = useCallback(async (requestId) => {
    setActionLoading(true);
    try {
      await friendsApi.cancelRequest(requestId);
      setRequests(prev => ({
        ...prev,
        sent: prev.sent.filter(r => r.id !== requestId),
      }));
    } catch (err) {
      setError(err.message || 'Failed to cancel friend request');
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Handle remove friend
  const handleRemoveFriend = useCallback(async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    setActionLoading(true);
    try {
      await friendsApi.removeFriend(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (err) {
      setError(err.message || 'Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Calculate request count for badge
  const requestCount = requests.received.length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-700 rounded w-1/3"></div>
            <div className="h-12 bg-surface-700 rounded"></div>
            <div className="h-32 bg-surface-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Friends</h1>
          <p className="text-gray-400 mt-1">
            Connect with study buddies and manage your friend list
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Search */}
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Find Friends</h2>
            <UserSearch
              onSendRequest={handleSendRequest}
              searchUsers={friendsApi.searchUsers}
              isLoading={actionLoading}
            />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-surface-700">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors relative
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'}
              `}
            >
              {tab.label}
              {tab.id === 'requests' && requestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {requestCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'friends' && (
          <div className="space-y-3">
            {friends.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No friends yet</h3>
                  <p className="text-gray-400">
                    Search for users above to start connecting with study buddies!
                  </p>
                </div>
              </Card>
            ) : (
              friends.map(friend => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onRemove={handleRemoveFriend}
                  isRemoving={actionLoading}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Received Requests */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Received Requests ({requests.received.length})
              </h3>
              {requests.received.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No pending friend requests
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.received.map(request => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="received"
                      onAccept={handleAcceptRequest}
                      onDecline={handleDeclineRequest}
                      isLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Sent Requests ({requests.sent.length})
              </h3>
              {requests.sent.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No pending sent requests
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.sent.map(request => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="sent"
                      onCancel={handleCancelRequest}
                      isLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
