import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuthStore } from '../../state/authStore';

export default function MessageList({ messages, typingUsers, isLoading }) {
  const { user } = useAuthStore();
  const bottomRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No messages yet</p>
          <p className="text-sm mt-1">Start the conversation!</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-surface-700 text-gray-300 text-xs px-3 py-1 rounded-full">
              {formatDateHeader(date)}
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-2">
            {dateMessages.map((message, index) => {
              const isOwn = message.sender?.id === user?.id;
              const showAvatar = !isOwn && (
                index === 0 || 
                dateMessages[index - 1]?.sender?.id !== message.sender?.id
              );

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message, isOwn, showAvatar }) {
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <p className="text-xs text-gray-400 italic">
          {message.sender?.username || 'Someone'} {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar placeholder */}
      <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-full bg-primary-900/30 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-400">
              {(message.sender?.username || '?').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`
          max-w-[70%] px-4 py-2 rounded-2xl
          ${isOwn
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-surface-700 text-white rounded-bl-md'}
        `}
      >
        {!isOwn && showAvatar && (
          <p className="text-xs font-medium text-primary-400 mb-1">
            {message.sender?.username}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className={`text-xs ${isOwn ? 'text-primary-200' : 'text-gray-400'}`}>
            {formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className={`text-xs ${isOwn ? 'text-primary-200' : 'text-gray-400'}`}>
              (edited)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function groupMessagesByDate(messages) {
  return messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
}

function formatDateHeader(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string,
    }),
    content: PropTypes.string.isRequired,
    type: PropTypes.string,
    isEdited: PropTypes.bool,
    createdAt: PropTypes.string.isRequired,
  })).isRequired,
  typingUsers: PropTypes.arrayOf(PropTypes.string),
  isLoading: PropTypes.bool,
};

MessageList.defaultProps = {
  typingUsers: [],
  isLoading: false,
};

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool.isRequired,
  showAvatar: PropTypes.bool.isRequired,
};
