import PropTypes from 'prop-types';

export default function ChatSidebar({ chats, selectedChatId, onSelectChat, onNewChat }) {
  return (
    <div className="h-full flex flex-col bg-surface-900/60 border-r border-surface-700">
      {/* Header */}
      <div className="p-4 border-b border-surface-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Chats</h2>
          <button
            onClick={onNewChat}
            className="p-2 text-primary-400 hover:bg-primary-900/20 rounded-lg transition-colors"
            title="New chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p>No chats yet</p>
            <p className="text-sm mt-1">Start a conversation with a friend!</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-700">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatListItem({ chat, isSelected, onClick }) {
  // Get display name based on chat type
  const displayName = chat.type === 'group'
    ? chat.name
    : chat.participants[0]?.displayName || chat.participants[0]?.username || 'Unknown';

  // Get avatar or initials
  const avatarUrl = chat.type === 'direct' ? chat.participants[0]?.avatarUrl : null;
  const initials = displayName.charAt(0).toUpperCase();

  // Format last message time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 flex items-center gap-3 text-left transition-colors
        ${isSelected 
          ? 'bg-primary-900/20' 
          : 'hover:bg-surface-700/50'}
      `}
    >
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${chat.type === 'group' 
            ? 'bg-accent-900/30' 
            : 'bg-primary-900/30'}
        `}>
          {chat.type === 'group' ? (
            <svg className="w-6 h-6 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ) : (
            <span className="text-lg font-semibold text-primary-400">
              {initials}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`font-medium truncate ${isSelected ? 'text-primary-400' : 'text-white'}`}>
            {displayName}
          </p>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {formatTime(chat.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-gray-400 truncate">
            {chat.lastMessage?.content || 'No messages yet'}
          </p>
          {chat.unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

ChatSidebar.propTypes = {
  chats: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['direct', 'group']).isRequired,
    name: PropTypes.string,
    participants: PropTypes.array,
    lastMessage: PropTypes.object,
    lastMessageAt: PropTypes.string,
    unreadCount: PropTypes.number,
  })).isRequired,
  selectedChatId: PropTypes.string,
  onSelectChat: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
};

ChatListItem.propTypes = {
  chat: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
