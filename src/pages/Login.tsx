import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import '@/styles/pages/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="login-container">
      <button 
        type="button" 
        className="theme-toggle-btn" 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="login-card animate-slide-up">
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
    </div>
  );
}
