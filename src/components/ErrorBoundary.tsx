import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}



export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-700">
                An unexpected error occurred. The error has been reported.
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border-2 border-red-500">
              <details className="text-sm" open>
                <summary className="cursor-pointer font-medium text-black">
                  Error details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong className="text-black">Message:</strong>
                    <p className="text-red-700 mt-1 font-mono text-xs">
                      {this.state.error?.message}
                    </p>
                  </div>
                  {this.state.error?.stack && (
                    <div>
                      <strong className="text-black">Stack trace:</strong>
                      <pre className="text-xs text-gray-700 mt-1 overflow-auto max-h-32 bg-white p-2 rounded border">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>

            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}