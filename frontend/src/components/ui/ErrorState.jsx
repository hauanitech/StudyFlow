import { Link } from 'react-router-dom';

// SVG Icons for error states
const ErrorIcons = {
  warning: (
    <svg className="w-12 h-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  notFound: (
    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  network: (
    <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  unauthorized: (
    <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  server: (
    <svg className="w-12 h-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  timeout: (
    <svg className="w-12 h-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
};

const ERROR_TYPES = {
  generic: {
    icon: ErrorIcons.warning,
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
  notFound: {
    icon: ErrorIcons.notFound,
    title: 'Not Found',
    message: "We couldn't find what you're looking for.",
  },
  network: {
    icon: ErrorIcons.network,
    title: 'Connection Error',
    message:
      "Unable to connect to the server. Please check your internet connection.",
  },
  unauthorized: {
    icon: ErrorIcons.unauthorized,
    title: 'Access Denied',
    message: "You don't have permission to access this resource.",
  },
  serverError: {
    icon: ErrorIcons.server,
    title: 'Server Error',
    message: "Our servers are having trouble. We're working on it.",
  },
  timeout: {
    icon: ErrorIcons.timeout,
    title: 'Request Timeout',
    message: 'The request took too long. Please try again.',
  },
};

export default function ErrorState({
  type = 'generic',
  title,
  message,
  icon,
  onRetry,
  retryLabel = 'Try Again',
  showHomeLink = false,
  fullPage = false,
  className = '',
}) {
  const errorConfig = ERROR_TYPES[type] || ERROR_TYPES.generic;

  const displayIcon = icon || errorConfig.icon;
  const displayTitle = title || errorConfig.title;
  const displayMessage = message || errorConfig.message;

  const content = (
    <div className={`card text-center ${className}`}>
      <div className="flex justify-center mb-4">{displayIcon}</div>
      <h2 className="text-xl font-bold text-white mb-2">{displayTitle}</h2>
      <p className="text-gray-400 mb-6">{displayMessage}</p>

      <div className="flex flex-wrap justify-center gap-4">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            {retryLabel}
          </button>
        )}
        {showHomeLink && (
          <Link to="/" className="btn-secondary">
            Go Home
          </Link>
        )}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full">{content}</div>
      </div>
    );
  }

  return content;
}

// Inline error for form fields
export function InlineError({ message }) {
  if (!message) return null;

  return (
    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {message}
    </p>
  );
}

// Alert-style error for top of page/section
export function ErrorAlert({ message, onDismiss }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Empty state for lists
export function EmptyState({
  icon,
  title = 'Nothing here yet',
  message,
  action,
  actionLabel,
}) {
  return (
    <div className="card text-center py-12">
      <div className="flex justify-center mb-4">
        {icon || ErrorIcons.empty}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {message && <p className="text-gray-400 mb-4">{message}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
