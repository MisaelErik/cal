
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl border-2 border-red-300 dark:border-red-700">
                <h1 className="text-3xl font-bold text-red-700 dark:text-red-400">Oops! Algo salió mal.</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">La aplicación encontró un error y no puede continuar. Esto previene que la aplicación se cierre inesperadamente.</p>
                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg text-sm text-red-600 dark:text-red-400">
                    <h2 className="font-bold text-lg">Detalles del Error:</h2>
                    <pre className="mt-2 font-mono text-md whitespace-pre-wrap">
                        {this.state.error?.toString()}
                    </pre>
                    {this.state.errorInfo && (
                        <pre className="mt-4 font-mono text-xs whitespace-pre-wrap overflow-auto">
                            {this.state.errorInfo.componentStack}
                        </pre>
                    )}
                </div>
                 <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
                >
                    Recargar la Página
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
