import React, { useState, useEffect, useRef } from 'react';
import { APPS } from '@/data/apps';
import { useWindowStore } from '@/stores/windowStore';
import './CommandBar.css';

interface CommandBarProps {
  onClose: () => void;
}

export default function CommandBar({ onClose }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const windowStore = useWindowStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredApps = APPS.filter(
    (app) =>
      app.name.toLowerCase().includes(query.toLowerCase()) ||
      app.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredApps.length > 0 ? (prev + 1) % filteredApps.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredApps.length > 0 ? (prev - 1 + filteredApps.length) % filteredApps.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredApps.length > 0) {
          const appToOpen = filteredApps[selectedIndex];
          windowStore.openWindow(appToOpen);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredApps, selectedIndex, onClose, windowStore]);

  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="command-bar-overlay" onClick={handleOverlayClick}>
      <div className="command-bar-container animate-slide-down">
        <div className="command-bar-input-wrapper">
          <span className="command-bar-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="command-bar-input"
            placeholder="Hledat aplikace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="command-bar-esc-hint">ESC</span>
        </div>

        {filteredApps.length > 0 ? (
          <div className="command-bar-results" ref={resultsRef}>
            {filteredApps.map((app, index) => {
              const isActive = index === selectedIndex;
              return (
                <div
                  key={app.id}
                  className={`command-bar-result-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    windowStore.openWindow(app);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div
                    className="command-bar-item-icon-wrapper"
                    style={{
                      background: `linear-gradient(135deg, ${app.color}22, ${app.color}44)`,
                      border: `1px solid ${app.color}33`,
                    }}
                  >
                    <span className="command-bar-item-icon">{app.icon}</span>
                  </div>
                  <div className="command-bar-item-details">
                    <span className="command-bar-item-name">{app.name}</span>
                    <span className="command-bar-item-desc">{app.description}</span>
                  </div>
                  <div className="command-bar-item-action">
                    {isActive && <span className="command-bar-item-enter-hint">spustit ↩</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="command-bar-no-results">
            <span className="command-bar-no-results-icon">🤷</span>
            <span className="command-bar-no-results-text">Nebyly nalezeny žádné aplikace pro "{query}"</span>
          </div>
        )}

        <div className="command-bar-footer">
          <span className="command-bar-footer-item">
            <kbd>↑↓</kbd> navigace
          </span>
          <span className="command-bar-footer-item">
            <kbd>↵</kbd> otevřít
          </span>
          <span className="command-bar-footer-item">
            <kbd>esc</kbd> zavřít
          </span>
        </div>
      </div>
    </div>
  );
}
