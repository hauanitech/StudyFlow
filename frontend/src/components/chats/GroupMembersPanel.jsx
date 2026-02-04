import PropTypes from 'prop-types';

export default function GroupMembersPanel({ members, isOpen, onClose, currentUserId }) {
  if (!isOpen) return null;

  return (
    <div className="w-72 h-full bg-surface-900/60 border-l border-surface-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-700 flex items-center justify-between">
        <h3 className="font-semibold text-white">Group Members</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white hover:bg-surface-700 rounded transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Members count */}
      <div className="px-4 py-2 text-sm text-gray-400">
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-surface-700">
          {members.map((member) => {
            const displayName = member.displayName || member.username;
            const isCurrentUser = member.id === currentUserId;

            return (
              <li
                key={member.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-surface-700/50 transition-colors"
              >
                {/* Avatar */}
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-400">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">
                      {displayName}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  {member.displayName && member.displayName !== member.username && (
                    <p className="text-sm text-gray-400 truncate">
                      @{member.username}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

GroupMembersPanel.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      displayName: PropTypes.string,
      avatarUrl: PropTypes.string,
    })
  ).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
};

GroupMembersPanel.defaultProps = {
  currentUserId: null,
};
