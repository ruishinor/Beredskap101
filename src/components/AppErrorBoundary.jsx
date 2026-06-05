import React from 'react';
import { eraseAllLocalAppData } from '../utils/saveSystem';

export default class AppErrorBoundary extends React.Component {
  state = {
    hasError: false,
    errorMessage: '',
    clearing: false,
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown application error',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Beredskap101 application render failure', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  reloadApp = () => {
    window.location.reload();
  };

  eraseAndReload = async () => {
    this.setState({ clearing: true });
    await eraseAllLocalAppData();
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="theme-light min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4 py-10">
        <section
          role="alert"
          aria-labelledby="app-error-title"
          className="w-full max-w-xl rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Beredskap101</p>
          <h1 id="app-error-title" className="mt-2 text-2xl font-bold text-[var(--text)]">
            Appen stoppet uventet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Prøv å laste appen på nytt. Hvis feilen kommer tilbake, kan du slette lokale appdata på denne enheten og starte på nytt.
          </p>
          <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--bg-alt)] p-3 text-xs text-[var(--muted)]">
            {this.state.errorMessage}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={this.reloadApp}
              className="min-h-11 rounded-md bg-[var(--accent-solid)] px-4 text-sm font-bold text-[var(--accent-on-solid)]"
            >
              Last inn på nytt
            </button>
            <button
              type="button"
              onClick={this.eraseAndReload}
              disabled={this.state.clearing}
              className="min-h-11 rounded-md border border-red-600 px-4 text-sm font-bold text-red-700 disabled:opacity-60"
            >
              {this.state.clearing ? 'Sletter lokale data...' : 'Slett lokale appdata'}
            </button>
          </div>
        </section>
      </main>
    );
  }
}
