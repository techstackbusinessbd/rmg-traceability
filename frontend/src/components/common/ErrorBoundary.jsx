import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in React Component Tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Application Exception Caught</h2>
                <p className="text-xs text-slate-400 font-mono">Module 01: System Admin & Auth</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
              An unexpected error occurred while rendering the interface. The error state has been isolated to prevent application crash.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-red-400 overflow-x-auto mb-6 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>Return to Admin Console</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
