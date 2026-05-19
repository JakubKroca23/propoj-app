import React from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileSection() {
  const { user, logout } = useAuthStore();

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
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      <div className="flex items-center gap-4" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div
          className="flex items-center justify-center font-bold"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white',
            fontSize: '1.5rem',
            boxShadow: '0 4px 14px var(--accent-glow)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {getInitials(user.name)}
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
          <p className="text-sm text-secondary">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-secondary">ID Uživatele</span>
          <span className="text-sm text-primary" style={{ fontFamily: 'monospace', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            {user.$id}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-secondary">Backend Endpoint</span>
          <span className="text-sm text-primary" style={{ fontFamily: 'monospace', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            {import.meta.env.VITE_APPWRITE_ENDPOINT}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-secondary">Appwrite Project ID</span>
          <span className="text-sm text-primary" style={{ fontFamily: 'monospace', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            {import.meta.env.VITE_APPWRITE_PROJECT_ID}
          </span>
        </div>

        <div className="flex justify-between items-center" style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-secondary">Verze Canvas OS</span>
            <span className="text-xs text-primary">v1.0.0-alpha (MVP)</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="login-submit-btn"
            style={{ width: 'auto', margin: '0', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#FF6B6B', boxShadow: 'none' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            Odhlásit se
          </button>
        </div>
      </div>
    </div>
  );
}
