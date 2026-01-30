export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 focus-visible:ring-primary-500 shadow-glow hover:shadow-glow-lg',
    secondary: 'bg-surface-800 text-gray-100 hover:bg-surface-700 focus-visible:ring-surface-500 border border-surface-600',
    danger: 'bg-red-600/90 text-white hover:bg-red-500 focus-visible:ring-red-500',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-surface-800/50 focus-visible:ring-surface-500',
    outline: 'border-2 border-primary-500/50 text-primary-400 hover:bg-primary-600/20 hover:border-primary-400 focus-visible:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]',
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium 
        transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-galaxy-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {loading && <span className="sr-only">Loading...</span>}
      {children}
    </button>
  );
}

export default Button;
