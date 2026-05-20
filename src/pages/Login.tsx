import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import '@/styles/pages/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { login, isLoading, error } = useAuthStore();

  const [isLocked, setIsLocked] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);

      const dateStr = now.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const capitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      setDate(capitalized);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    setTimeout(() => {
      setIsLocked(false);
    }, 600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked && !isUnlocking) {
        handleUnlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isUnlocking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="login-container" onClick={isLocked ? handleUnlock : undefined}>
      {/* Background blobs & grid */}
      <div className="login-bg-grid" />
      <div className="neon-sphere sphere-1" />
      <div className="neon-sphere sphere-2" />
      <div className="neon-sphere sphere-3" />
      <div className="neon-sphere sphere-4" />

      <button 
        type="button" 
        className="theme-toggle-btn" 
        onClick={(e) => {
          e.stopPropagation(); // Zabránit odemčení při kliknutí na motiv
          toggleTheme();
        }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {isLocked && (
        <div className={`lockscreen-overlay ${isUnlocking ? 'unlocking' : ''}`}>
          <div className="lockscreen-clock-container">
            <div className="lockscreen-time">{time}</div>
            <div className="lockscreen-date">{date}</div>
          </div>
          <div className="lockscreen-prompt">
            <span className="prompt-icon">🔒</span>
            <span className="prompt-text">Kliknutím nebo libovolnou klávesou odemkněte</span>
          </div>
        </div>
      )}

      {(!isLocked || isUnlocking) && (
        <div 
          className={`login-card ${isUnlocking ? 'reveal' : 'animate-slide-up'}`}
          onClick={(e) => e.stopPropagation()} // Zabránit probublávání kliknutí
        >
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">P</div>
              <span className="logo-text">propoj.app</span>
            </div>
            <h2 className="login-title">Vítej zpět</h2>
            <p className="login-subtitle">Přihlas se do svého Canvas OS</p>
          </div>

          {error && (
            <div className="login-error-alert animate-slide-down">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                E-mailová adresa
              </label>
              <div className="input-wrapper">
                <input
                  id="email-input"
                  type="email"
                  className="form-input"
                  placeholder="jmeno@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                Heslo
              </label>
              <div className="input-wrapper">
                <input
                  id="password-input"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  <span>Přihlašování...</span>
                </>
              ) : (
                <span>Přihlásit se</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

