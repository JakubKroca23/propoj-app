import React, { useState, useEffect } from 'react';
import { useEmailStore, EmailAccountConfig } from '@/stores/emailStore';
import { useAuthStore } from '@/stores/authStore';

export default function EmailSection() {
  const { user } = useAuthStore();
  const { accountConfig, isConnected, isLoading, error, saveAccountConfig, clearAccountConfig, loadConfig } = useEmailStore();

  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState(993);
  const [imapSecure, setImapSecure] = useState(true);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user?.$id) {
      loadConfig(user.$id);
    }
  }, [user?.$id, loadConfig]);

  useEffect(() => {
    if (accountConfig) {
      setImapHost(accountConfig.imapHost || '');
      setImapPort(accountConfig.imapPort || 993);
      setImapSecure(accountConfig.imapSecure !== false);
      setSmtpHost(accountConfig.smtpHost || '');
      setSmtpPort(accountConfig.smtpPort || 465);
      setSmtpSecure(accountConfig.smtpSecure !== false);
      setUsername(accountConfig.username || '');
      setPassword(accountConfig.password || '');
    }
  }, [accountConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.$id) return;

    const config: EmailAccountConfig = {
      imapHost,
      imapPort: Number(imapPort),
      imapSecure,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpSecure,
      username,
      password
    };

    await saveAccountConfig(config, user.$id);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDisconnect = async () => {
    if (!user?.$id) return;
    if (window.confirm('Opravdu chcete odebrat e-mailový účet a vymazat konfiguraci?')) {
      await clearAccountConfig(user.$id);
      setImapHost('');
      setImapPort(993);
      setImapSecure(true);
      setSmtpHost('');
      setSmtpPort(465);
      setSmtpSecure(true);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="settings-section-content animate-fade-in" style={{ maxWidth: '640px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>E-mailový účet</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Konfigurace IMAP a SMTP serverů pro reálnou e-mailovou schránku v systému Canvas OS.
          </p>
        </div>
        
        {/* Stavový badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: isConnected ? '#10b981' : '#f59e0b'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#f59e0b',
            boxShadow: `0 0 8px ${isConnected ? '#10b981' : '#f59e0b'}`
          }} />
          {isConnected ? 'Reálné připojení' : 'Offline Demo režim'}
        </div>
      </div>

      {!isConnected && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '0.8rem',
          lineHeight: '1.4',
          color: 'var(--text-secondary)'
        }}>
          💡 <strong>Tip pro demo:</strong> Dokud zde nenastavíte své credentials, e-mailový klient bude fungovat v perzistentním <strong>offline demo režimu</strong> s nádhernou sadou zkušebních e-mailů. Můžete je číst, mazat i simulovat odesílání!
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.8rem',
          color: '#ef4444'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Přihlašovací údaje */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Údaje účtu</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>E-mailová adresa / Uživatelské jméno</label>
            <input
              type="email"
              required
              placeholder="napr. pepa@propoj.app"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)',
                color: '#ffffff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Heslo / Aplikační heslo</label>
            <input
              type="password"
              required
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)',
                color: '#ffffff',
                fontSize: '0.85rem'
              }}
            />
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
              Pro služby Gmail/Seznam doporučujeme v nastavení jejich účtu vygenerovat dedikované <em>heslo pro aplikace</em>.
            </span>
          </div>
        </div>

        {/* Konfigurace IMAP */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>IMAP Server (Příchozí pošta)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Hostitel (IMAP Server)</label>
              <input
                type="text"
                required
                placeholder="imap.domain.com"
                value={imapHost}
                onChange={(e) => setImapHost(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Port</label>
              <input
                type="number"
                required
                value={imapPort}
                onChange={(e) => setImapPort(Number(e.target.value))}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={imapSecure}
              onChange={(e) => setImapSecure(e.target.checked)}
              style={{ accentColor: '#EF4444' }}
            />
            Použít SSL/TLS šifrování (Doporučeno)
          </label>
        </div>

        {/* Konfigurace SMTP */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>SMTP Server (Odchozí pošta)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Hostitel (SMTP Server)</label>
              <input
                type="text"
                required
                placeholder="smtp.domain.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Port</label>
              <input
                type="number"
                required
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={smtpSecure}
              onChange={(e) => setSmtpSecure(e.target.checked)}
              style={{ accentColor: '#EF4444' }}
            />
            Použít SSL/TLS šifrování (Doporučeno)
          </label>
        </div>

        {/* Tlačítka */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ef4444 0%, #c22727 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Ukládám a testuji...' : isSaved ? '✓ Uloženo a Připojeno' : 'Uložit a Připojit'}
          </button>

          {isConnected && (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isLoading}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Odpojit účet
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
