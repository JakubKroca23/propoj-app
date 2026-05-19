import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function TaskbarUserMenu() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center font-bold no-select"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          color: 'white',
          fontSize: '0.8125rem',
          boxShadow: '0 2px 8px var(--accent-glow)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all var(--transition-fast)'
        }}
      >
        {getInitials(user.name)}
      </button>

      {open && (
        <div
          className="absolute glass animate-slide-up"
          style={{
            bottom: '48px',
            right: '0',
            width: '200px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
            padding: '6px',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            zIndex: 1000
          }}
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
            <p className="text-xs font-semibold text-primary truncate">{user.name}</p>
            <p className="text-xs text-secondary truncate" style={{ fontSize: '0.6875rem' }}>{user.email}</p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-xs font-medium w-full"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              textAlign: 'left',
              color: 'var(--text-primary)',
              transition: 'background var(--transition-fast)',
            }}
            onClick={() => {
              console.log('Profil clicked');
              setOpen(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>👤</span>
            <span>Profil</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 text-xs font-medium w-full"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              textAlign: 'left',
              color: 'var(--text-primary)',
              transition: 'background var(--transition-fast)',
            }}
            onClick={() => {
              console.log('Settings clicked');
              setOpen(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>⚙️</span>
            <span>Nastavení</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 text-xs font-semibold w-full"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              textAlign: 'left',
              color: '#FF6B6B',
              transition: 'background var(--transition-fast)',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '4px',
              paddingTop: '8px'
            }}
            onClick={() => {
              logout();
              setOpen(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>🚪</span>
            <span>Odhlásit se</span>
          </button>
        </div>
      )}
    </div>
  );
}
