import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ACCENT_COLORS = [
  { id: 'violet', name: 'Violet', color: '#6C47FF', glow: 'rgba(108,71,255,0.25)' },
  { id: 'blue', name: 'Blue', color: '#3B82F6', glow: 'rgba(59,130,246,0.25)' },
  { id: 'green', name: 'Green', color: '#10B981', glow: 'rgba(16,185,129,0.25)' },
  { id: 'orange', name: 'Orange', color: '#F59E0B', glow: 'rgba(245,158,11,0.25)' },
  { id: 'red', name: 'Red', color: '#EF4444', glow: 'rgba(239,68,68,0.25)' },
];

export default function AppearanceSection() {
  const { theme, toggleTheme } = useTheme();
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('canvas-os-accent') || 'violet';
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('canvas-os-reduced-motion') === 'true';
  });

  useEffect(() => {
    const selectedColor = ACCENT_COLORS.find((c) => c.id === accent);
    if (selectedColor) {
      document.documentElement.style.setProperty('--accent-primary', selectedColor.color);
      document.documentElement.style.setProperty('--accent-glow', selectedColor.glow);
      localStorage.setItem('canvas-os-accent', accent);
    }
  }, [accent]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      localStorage.setItem('canvas-os-reduced-motion', 'true');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      localStorage.setItem('canvas-os-reduced-motion', 'false');
    }
  }, [reducedMotion]);

  return (
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-primary">Barevný motiv</h3>
        <p className="text-xs text-secondary">Vyberte výchozí barevný režim rozhraní.</p>

        <div className="flex gap-4" style={{ marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => theme === 'light' && toggleTheme()}
            className="flex flex-col items-center justify-between glass text-left"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              flex: '1',
              border: `2px solid ${theme === 'dark' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              background: 'var(--bg-glass)',
              cursor: 'pointer',
              gap: '12px'
            }}
          >
            <div className="flex flex-col gap-2 w-full">
              <div 
                style={{ 
                  height: '60px', 
                  borderRadius: '6px', 
                  background: '#0D0F1A', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                <div style={{ height: '8px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
                <div style={{ height: '14px', width: '25%', background: '#6C47FF', borderRadius: '4px', marginTop: 'auto' }} />
              </div>
              <span className="text-xs font-semibold text-primary">Tmavý režim</span>
            </div>
            <span style={{ fontSize: '1.25rem' }}>{theme === 'dark' ? '🟢' : '⚪'}</span>
          </button>

          <button
            type="button"
            onClick={() => theme === 'dark' && toggleTheme()}
            className="flex flex-col items-center justify-between glass text-left"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              flex: '1',
              border: `2px solid ${theme === 'light' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              background: 'var(--bg-glass)',
              cursor: 'pointer',
              gap: '12px'
            }}
          >
            <div className="flex flex-col gap-2 w-full">
              <div 
                style={{ 
                  height: '60px', 
                  borderRadius: '6px', 
                  background: '#FFFFFF', 
                  border: '1px solid rgba(0,0,0,0.1)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ height: '8px', width: '60%', background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }} />
                <div style={{ height: '8px', width: '40%', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }} />
                <div style={{ height: '14px', width: '25%', background: '#4F46E5', borderRadius: '4px', marginTop: 'auto' }} />
              </div>
              <span className="text-xs font-semibold text-primary">Světlý režim</span>
            </div>
            <span style={{ fontSize: '1.25rem' }}>{theme === 'light' ? '🟢' : '⚪'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
        <h3 className="text-sm font-semibold text-primary">Akcentová barva</h3>
        <p className="text-xs text-secondary">Zvolte zvýrazňující barvu pro systémová tlačítka a okraje.</p>

        <div className="flex gap-3" style={{ marginTop: '12px' }}>
          {ACCENT_COLORS.map((col) => {
            const isSelected = col.id === accent;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setAccent(col.id)}
                className="flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: col.color,
                  border: `2px solid ${isSelected ? 'var(--text-primary)' : 'transparent'}`,
                  boxShadow: isSelected ? `0 0 12px ${col.color}` : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                title={col.name}
              >
                {isSelected && (
                  <span className="text-xs" style={{ color: 'white', fontWeight: 'bold' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-primary">Redukovat pohyb</span>
          <span className="text-xs text-secondary">Vypnout nebo zjednodušit plynulé animace a transformace.</span>
        </div>
        <button
          type="button"
          onClick={() => setReducedMotion(!reducedMotion)}
          className="glass flex items-center justify-center font-bold"
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            background: reducedMotion ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
            color: reducedMotion ? 'white' : 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          {reducedMotion ? 'Zapnuto' : 'Vypnuto'}
        </button>
      </div>
    </div>
  );
}
