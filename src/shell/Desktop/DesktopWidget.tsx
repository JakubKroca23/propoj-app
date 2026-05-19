import React from 'react';

interface DesktopWidgetProps {
  title: string;
  icon: string;
  children?: React.ReactNode;
}

export default function DesktopWidget({ title, icon, children }: DesktopWidgetProps) {
  return (
    <div 
      className="desktop-widget" 
      style={{
        padding: '20px',
        borderRadius: '18px',
        minWidth: '260px',
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(13, 17, 30, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div 
        className="flex items-center justify-between" 
        style={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)', 
          paddingBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px', 
            fontWeight: 600, 
            fontSize: '0.88rem', 
            color: 'var(--text-primary)' 
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <span>{title}</span>
        </div>
        <span 
          style={{ 
            fontSize: '0.65rem', 
            padding: '2px 8px', 
            background: 'rgba(255, 255, 255, 0.04)', 
            borderRadius: '20px',
            color: 'var(--text-secondary)',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}
        >
          LIVE
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: '80px' }}>
        {children}
      </div>
    </div>
  );
}
