import PropTypes from 'prop-types';
import { Button } from '../ui';

export default function FriendCard({ friend, onRemove, isRemoving }) {
  return (
    <div className="flex items-center gap-4 p-4 card">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.displayName || friend.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-900/30 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary-400">
              {(friend.displayName || friend.username || '?').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {friend.displayName || friend.username}
        </p>
        <p className="text-sm text-gray-400 truncate">
          @{friend.username}
        </p>
        {friend.bio && (
          <p className="text-sm text-gray-300 truncate mt-1">
            {friend.bio}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRemove(friend.id)}
          disabled={isRemoving}
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </Button>
      </div>
    </div>
  );
}

FriendCard.propTypes = {
  friend: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  isRemoving: PropTypes.bool,
};
