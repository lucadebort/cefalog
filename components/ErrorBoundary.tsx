import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Qui potresti inviare l'errore a un servizio di logging (es. Sentry)
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-gray-800 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">
              Qualcosa è andato storto
            </h1>

            <p className="text-muted mb-6">
              Si è verificato un errore imprevisto. I tuoi dati sono al sicuro.
            </p>

            {this.state.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button fullWidth onClick={this.handleReload}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica l'app
              </Button>

              <Button variant="ghost" fullWidth onClick={this.handleReset}>
                Riprova
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
