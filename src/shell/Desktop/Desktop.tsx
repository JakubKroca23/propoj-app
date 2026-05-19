import React from 'react';
import BentoLauncher from './BentoLauncher';
import DesktopWidget from './DesktopWidget';
import WindowManager from '../WindowManager/WindowManager';
import './Desktop.css';

export default function Desktop() {
  return (
    <div className="os-desktop" style={{ position: 'relative' }}>
      <div className="desktop-header">
        <h1 className="desktop-title">Canvas OS</h1>
        <p className="desktop-subtitle">Vítejte ve svém osobním workspace. Vyberte aplikaci z launcher gridu.</p>
      </div>

      <BentoLauncher />

      <div className="desktop-widgets-row">
        <DesktopWidget title="Počasí" icon="🌤" />
        <DesktopWidget title="Kalendář" icon="📅" />
        <DesktopWidget title="Úkoly" icon="✅" />
      </div>

      <WindowManager />
    </div>
  );
}
