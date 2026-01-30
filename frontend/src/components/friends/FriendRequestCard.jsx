import PropTypes from 'prop-types';
import { Button } from '../ui';

export default function FriendRequestCard({ request, type, onAccept, onDecline, onCancel, isLoading }) {
  const user = type === 'received' ? request.from : request.to;

  return (
    <div className="flex items-center gap-4 p-4 card">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName || user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-900/30 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary-400">
              {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {user.displayName || user.username}
        </p>
        <p className="text-sm text-gray-400 truncate">
          @{user.username}
        </p>
        {request.message && (
          <p className="text-sm text-gray-300 mt-1 italic">
            "{request.message}"
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {type === 'received' ? 'Received' : 'Sent'}{' '}
          {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-2">
        {type === 'received' ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(request.id)}
              disabled={isLoading}
            >
              Accept
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDecline(request.id)}
              disabled={isLoading}
            >
              Decline
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCancel(request.id)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

FriendRequestCard.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string.isRequired,
    from: PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string,
      displayName: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
    to: PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string,
      displayName: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
    message: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['received', 'sent']).isRequired,
  onAccept: PropTypes.func,
  onDecline: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
};
