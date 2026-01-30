import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you would send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI from props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="card">
              <div className="text-6xl mb-6">😵</div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Please try
                refreshing the page.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Refresh Page
                </button>
                <Link to="/" className="btn-secondary" onClick={this.handleReset}>
                  Go Home
                </Link>
              </div>

              {/* Show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                    Show Error Details
                  </summary>
                  <div className="mt-4 p-4 bg-red-900/20 rounded-lg overflow-auto text-xs">
                    <p className="font-mono text-red-400 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="font-mono text-red-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for easier use
export function withErrorBoundary(Component, fallback) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook-like wrapper for functional components
export function ErrorBoundaryWrapper({ children, fallback, onReset }) {
  return (
    <ErrorBoundary fallback={fallback} onReset={onReset}>
      {children}
    </ErrorBoundary>
  );
}
