import { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// ErrorBoundary — wraps whole app, catches white-screen crashes
// Shows user-friendly fallback + reset button instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console for dev debugging
    console.error('[PS5Vault ErrorBoundary]', error, errorInfo);
    // Store error for potential telemetry later (v1.2+)
    try {
      const log = JSON.parse(localStorage.getItem('ps5vault_error_log') || '[]');
      log.push({
        ts: new Date().toISOString(),
        msg: error?.message || String(error),
        stack: error?.stack?.slice(0, 500) || '',
      });
      // Keep only last 10 errors
      localStorage.setItem('ps5vault_error_log', JSON.stringify(log.slice(-10)));
    } catch {}
  }

  reset = () => {
    this.setState(s => ({ hasError: false, error: null, errorCount: s.errorCount + 1 }));
  };

  hardReload = () => {
    // Full reload - clears in-memory state, keeps localStorage
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('ps5vault_lang')) || 'pl';
      const isEn = lang === 'en';
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0A0E1A',
          color: '#E8EAF0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Syne', sans-serif",
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 400, width: '100%' }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
              filter: 'grayscale(0.3)',
            }}>🎮💥</div>
            <h1 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 24,
              fontWeight: 900,
              color: '#00D4FF',
              marginBottom: 12,
              letterSpacing: '0.05em',
            }}>
              {isEn ? 'Something broke' : 'Coś się zepsuło'}
            </h1>
            <p style={{
              fontSize: 14,
              color: '#8B93A7',
              lineHeight: 1.5,
              marginBottom: 24,
            }}>
              {isEn
                ? 'The app hit an unexpected error. Your data is safe in localStorage. Try resetting the view first — if that fails, reload the app.'
                : 'Apka trafiła na nieoczekiwany błąd. Twoje dane są bezpieczne w localStorage. Spróbuj najpierw zresetować widok — jeśli to nie pomoże, przeładuj apkę.'}
            </p>
            {this.state.error?.message && (
              <div style={{
                background: 'rgba(255,77,109,0.08)',
                border: '1px solid rgba(255,77,109,0.25)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 11,
                color: '#FF4D6D',
                marginBottom: 20,
                fontFamily: 'monospace',
                textAlign: 'left',
                wordBreak: 'break-word',
                maxHeight: 100,
                overflow: 'auto',
              }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={this.reset}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #00D4FF, #0060FF)',
                  color: '#fff',
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isEn ? '↻ Try again' : '↻ Spróbuj ponownie'}
              </button>
              <button
                type="button"
                onClick={this.hardReload}
                style={{
                  padding: '12px 16px',
                  border: '1px solid rgba(139,147,167,0.3)',
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#8B93A7',
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isEn ? '⟳ Reload app' : '⟳ Przeładuj apkę'}
              </button>
            </div>
            {this.state.errorCount > 1 && (
              <p style={{
                fontSize: 11,
                color: '#8B93A7',
                marginTop: 16,
                fontStyle: 'italic',
              }}>
                {isEn
                  ? `If the error keeps happening (${this.state.errorCount}×), please report it via the feedback option in Settings after reloading.`
                  : `Jeśli błąd się powtarza (${this.state.errorCount}×), zgłoś go przez opcję feedbacku w Ustawieniach po przeładowaniu.`}
              </p>
            )}
          </div>
        </div>
      );
    }

    // key prop forces full remount of App on reset
    return <App key={this.state.errorCount} />;
  }
}

createRoot(document.getElementById("root")).render(<ErrorBoundary />);
