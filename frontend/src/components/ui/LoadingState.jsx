export default function LoadingState({
  message = 'Loading...',
  fullPage = false,
  size = 'default',
}) {
  const sizes = {
    small: 'h-6 w-6',
    default: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-surface-700 border-t-primary-500`}
      />
      {message && <p className="text-gray-400 animate-pulse">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">{spinner}</div>
  );
}

// Skeleton loader variants
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-surface-700 rounded w-3/4 mb-4"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-surface-700 rounded mb-2 ${
            i === lines - 1 ? 'w-1/2' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, lines = 2 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-surface-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-6 bg-surface-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-surface-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-8 bg-surface-700 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-surface-700 rounded w-3/4 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, columns = 3 }) {
  return (
    <div
      className={`grid gap-4 ${
        columns === 2
          ? 'md:grid-cols-2'
          : columns === 3
          ? 'md:grid-cols-2 lg:grid-cols-3'
          : 'md:grid-cols-2 lg:grid-cols-4'
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-24 bg-surface-700 rounded mb-4"></div>
          <div className="h-4 bg-surface-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-surface-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
