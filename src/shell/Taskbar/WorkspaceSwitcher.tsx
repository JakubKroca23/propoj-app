import React from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export default function WorkspaceSwitcher() {
  const { workspaces, activeId, setActive } = useWorkspaceStore();

  return (
    <div className="flex items-center gap-1 glass" style={{ padding: '3px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
      {workspaces.map((ws) => {
        const isActive = ws.id === activeId;
        return (
          <button
            key={ws.id}
            type="button"
            className="flex items-center gap-2 text-xs font-medium"
            onClick={() => setActive(ws.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'all var(--transition-fast)',
              background: isActive ? ws.color : 'transparent',
              color: isActive ? 'white' : 'var(--text-secondary)',
              boxShadow: isActive ? `0 2px 10px ${ws.color}44` : 'none',
            }}
          >
            <span>{ws.icon}</span>
            <span className="no-select">{ws.name}</span>
          </button>
        );
      })}
    </div>
  );
}
