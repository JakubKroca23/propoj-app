import React from 'react';
import BentoLauncher from './BentoLauncher';
import DesktopWidget from './DesktopWidget';
import WindowManager from '../WindowManager/WindowManager';
import './Desktop.css';

export default function Desktop() {
  return (
    <div className="os-desktop">
      <div className="desktop-header">
        <div className="desktop-header-content">
          <h1 className="desktop-title">Canvas OS</h1>
          <p className="desktop-subtitle">Vítejte ve svém osobním workspace. Vyberte aplikaci z Bento Launcheru níže.</p>
        </div>
        <div className="desktop-status-pill">
          <span className="status-indicator"></span>
          <span className="status-text">Všechny systémy online</span>
        </div>
      </div>

      {/* Hlavní Bento Grid Launcher plocha */}
      <BentoLauncher />

      {/* Rychlé Widgets panel */}
      <div className="desktop-widgets-row">
        {/* Počasí Widget */}
        <DesktopWidget title="Počasí" icon="🌤">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>21°C</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Polojasno</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                <div>📍 Praha</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Vlhkost: 58%</div>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '6px', 
              marginTop: '4px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>St</span>
                <span style={{ fontSize: '1rem', margin: '2px 0' }}>🌦</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>18°</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Čt</span>
                <span style={{ fontSize: '1rem', margin: '2px 0' }}>☀️</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>23°</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Pá</span>
                <span style={{ fontSize: '1rem', margin: '2px 0' }}>🌤</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>22°</span>
              </div>
            </div>
          </div>
        </DesktopWidget>

        {/* Kalendář Widget */}
        <DesktopWidget title="Dnešní události" icon="📅">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              background: 'linear-gradient(90deg, rgba(108, 71, 255, 0.15) 0%, rgba(0,0,0,0) 100%)',
              borderLeft: '3px solid #6C47FF',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>Týmový Sync — propoj.app</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>14:00 - 15:00 | Online</div>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, rgba(0,0,0,0) 100%)',
              borderLeft: '3px solid #22C55E',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>Večeře s investory</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>19:30 - 21:00 | Kampa Park</div>
            </div>
          </div>
        </DesktopWidget>

        {/* Úkoly Widget */}
        <DesktopWidget title="Úkoly a prioritní cíle" icon="✅">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
              <span style={{ color: '#22C55E' }}>✓</span>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>Vytvořit postMessage sandbox bridge</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>○</span>
              <span style={{ color: 'var(--text-primary)' }}>Naplánovat Fázi 3 (Produktivita)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>○</span>
              <span style={{ color: 'var(--text-primary)' }}>Implementovat Tiptap editor do Poznámek</span>
            </div>
          </div>
        </DesktopWidget>
      </div>

      <WindowManager />
    </div>
  );
}
