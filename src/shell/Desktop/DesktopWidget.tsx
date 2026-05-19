import React from 'react';

interface DesktopWidgetProps {
  title: string;
  icon: string;
  children?: React.ReactNode;
}

export default function DesktopWidget({ title, icon, children }: DesktopWidgetProps) {
  return (
    <div 
      className="glass" 
      style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        minWidth: '240px',
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
        animation: 'scaleIn 350ms ease-out forwards',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-glass)'
      }}
    >
      <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <div className="flex items-center gap-2 font-semibold">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span className="text-xs text-muted" style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>Widget</span>
      </div>
      <div className="flex flex-col gap-1 justify-center items-center" style={{ minHeight: '80px' }}>
        {children ? children : (
          <>
            <span className="text-sm font-medium text-secondary">Bude dostupné brzy</span>
            <span className="text-xs text-muted">Ve Fázi 3 & 4</span>
          </>
        )}
      </div>
    </div>
  );
}
