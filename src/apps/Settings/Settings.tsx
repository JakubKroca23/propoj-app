import React, { useState } from 'react';
import ProfileSection from './sections/ProfileSection';
import AppearanceSection from './sections/AppearanceSection';
import PluginsSection from './sections/PluginsSection';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'workspaces' | 'plugins'>('profile');

  return (
    <div className="settings-panel">
      <aside className="settings-sidebar">
        <nav className="settings-nav">
          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="settings-nav-icon">👤</span>
            <span className="settings-nav-label">Profil</span>
          </button>
          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <span className="settings-nav-icon">🎨</span>
            <span className="settings-nav-label">Vzhled</span>
          </button>
          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'workspaces' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspaces')}
          >
            <span className="settings-nav-icon">🖥️</span>
            <span className="settings-nav-label">Pracovní plochy</span>
          </button>
          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'plugins' ? 'active' : ''}`}
            onClick={() => setActiveTab('plugins')}
          >
            <span className="settings-nav-icon">🔌</span>
            <span className="settings-nav-label">Pluginy</span>
          </button>
        </nav>
      </aside>
      <main className="settings-content">
        <div key={activeTab} className="settings-section-container animate-fade-in">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Uživatelský profil</h2>
              <p className="settings-section-subtitle">Správa vašeho účtu a systémových přihlašovacích údajů.</p>
              <div className="settings-section-content">
                <ProfileSection />
              </div>
            </div>
          )}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Vzhled a přizpůsobení</h2>
              <p className="settings-section-subtitle">Upravte si motiv, barvy a chování animací na ploše.</p>
              <div className="settings-section-content">
                <AppearanceSection />
              </div>
            </div>
          )}
          {activeTab === 'workspaces' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Pracovní plochy</h2>
              <p className="settings-section-subtitle">Správa virtuálních pracovních prostorů.</p>
              <div className="settings-section-content placeholder-section">
                <div className="settings-placeholder-graphic">🖥️</div>
                <p className="settings-placeholder-text">
                  Detailní nastavení a pojmenování pracovních ploch bude přidáno ve Fázi 2/3.
                </p>
              </div>
            </div>
          )}
          {activeTab === 'plugins' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Systémové pluginy</h2>
              <p className="settings-section-subtitle">Instalace a správa rozšiřujících doplňků systému Canvas OS.</p>
              <div className="settings-section-content">
                <PluginsSection />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
