import React, { useState, useEffect } from 'react';
import { useEmailStore, EmailMessage } from '@/stores/emailStore';
import { useAuthStore } from '@/stores/authStore';
import './Email.css';

export default function Email() {
  const { user } = useAuthStore();
  const {
    messages,
    selectedMessage,
    activeFolder,
    isLoading,
    error,
    loadMessages,
    fetchMessageBody,
    sendEmail,
    deleteMessage,
    toggleReadStatus,
    setActiveFolder,
    setSelectedMessage,
    loadConfig
  } = useEmailStore();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Spustíme načtení po přihlášení uživatele
  useEffect(() => {
    if (user?.$id) {
      loadConfig(user.$id).then(() => {
        loadMessages(user.$id);
      });
    }
  }, [user?.$id]);

  // Handler pro stažení detailu a označení za přečtené
  const handleSelectMessage = async (msg: EmailMessage) => {
    setSelectedMessage(msg);
    if (user?.$id) {
      if (!msg.read) {
        toggleReadStatus(msg.id, user.$id, true);
      }
      await fetchMessageBody(msg.id, user.$id);
    }
  };

  // Handler pro mazání zprávy
  const handleDeleteMessage = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user?.$id) {
      deleteMessage(id, user.$id);
    }
  };

  // Handler pro odeslání emailu
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      alert('Prosím, vyplňte všechna pole.');
      return;
    }

    setIsSending(true);
    try {
      if (user?.$id) {
        await sendEmail(composeTo.trim(), composeSubject.trim(), composeBody.trim(), user.$id);
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        alert('E-mail byl úspěšně odeslán!');
      }
    } catch (err: any) {
      alert(`Nepodařilo se odeslat e-mail: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Handler pro kliknutí na "Odpovědět"
  const handleReply = () => {
    if (!selectedMessage) return;
    
    // Extrahujeme email z odesílatele (např. "Pepa <pepa@gmail.com>" -> "pepa@gmail.com")
    let replyTo = selectedMessage.from;
    const match = selectedMessage.from.match(/<(.+?)>/);
    if (match && match[1]) {
      replyTo = match[1];
    }

    setComposeTo(replyTo);
    setComposeSubject(`Re: ${selectedMessage.subject}`);
    setComposeBody(`\n\n----- Původní zpráva -----\nOd: ${selectedMessage.from}\nDatum: ${new Date(selectedMessage.date).toLocaleString('cs-CZ')}\nPředmět: ${selectedMessage.subject}\n\n${selectedMessage.body || ''}`);
    setIsComposeOpen(true);
  };

  // Filtrování zpráv podle aktivní složky a vyhledávacího dotazu
  const folderMessages = messages.filter(m => m.folder === activeFolder);
  
  const filteredMessages = folderMessages.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      m.subject.toLowerCase().includes(query) ||
      m.from.toLowerCase().includes(query) ||
      (m.body && m.body.toLowerCase().includes(query))
    );
  });

  // Počet nepřečtených zpráv v inboxu
  const unreadInboxCount = messages.filter(m => m.folder === 'inbox' && !m.read).length;

  const getInitials = (fromStr: string) => {
    // Odstraníme uvozovky a vezmeme první písmeno
    const clean = fromStr.replace(/["']/g, '').trim();
    return clean.charAt(0).toUpperCase();
  };

  // Gradient barva pro avatar podle odesílatele
  const getAvatarGradient = (fromStr: string) => {
    const colors = [
      'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
      'linear-gradient(135deg, #4E65FF 0%, #92EFFD 100%)',
      'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      'linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)',
      'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
    ];
    let sum = 0;
    for (let i = 0; i < fromStr.length; i++) sum += fromStr.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="email-app">
      {/* 1. Levý postranní panel (Složky & Napsat) */}
      <aside className="email-sidebar">
        <button className="btn-compose-mail" onClick={() => setIsComposeOpen(true)}>
          <span className="compose-icon">➕</span> Napsat e-mail
        </button>

        <nav className="email-folders-nav">
          <button 
            className={`folder-item ${activeFolder === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveFolder('inbox')}
          >
            <span className="folder-icon">📥</span>
            <span className="folder-label">Doručená pošta</span>
            {unreadInboxCount > 0 && <span className="unread-badge">{unreadInboxCount}</span>}
          </button>

          <button 
            className={`folder-item ${activeFolder === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveFolder('sent')}
          >
            <span className="folder-icon">📤</span>
            <span className="folder-label">Odeslané</span>
          </button>

          <button 
            className={`folder-item ${activeFolder === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveFolder('trash')}
          >
            <span className="folder-icon">🗑️</span>
            <span className="folder-label">Koš</span>
          </button>
        </nav>

        {error && (
          <div className="sidebar-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text" title={error}>{error}</span>
          </div>
        )}
      </aside>

      {/* 2. Prostřední panel (Seznam zpráv) */}
      <section className="email-list-pane">
        <header className="email-list-header">
          <div className="email-search-wrapper">
            <input
              type="text"
              placeholder="Vyhledat v poště..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="email-search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
        </header>

        <div className="email-list-scrollable">
          {isLoading && filteredMessages.length === 0 ? (
            <div className="email-list-status">Načítám zprávy...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="email-list-status">
              {searchQuery ? 'Žádné e-maily neodpovídají vyhledávání.' : 'Složka je prázdná.'}
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`email-item-card ${selectedMessage?.id === msg.id ? 'selected' : ''} ${!msg.read ? 'unread' : ''}`}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div 
                    className="email-avatar" 
                    style={{ background: getAvatarGradient(msg.from) }}
                  >
                    {getInitials(msg.from)}
                  </div>

                  <div className="email-item-info">
                    <div className="email-item-header">
                      <span className="email-item-sender">{msg.from.split(' <')[0]}</span>
                      <span className="email-item-date">
                        {new Date(msg.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                      </span>
                    </div>
                    
                    <h4 className="email-item-subject">{msg.subject}</h4>
                    <p className="email-item-snippet">
                      {msg.body ? msg.body.substring(0, 75) + '...' : '(Bez obsahu)'}
                    </p>
                  </div>
                </div>

                <div className="email-item-actions">
                  <button 
                    onClick={(e) => handleDeleteMessage(e, msg.id)}
                    className="btn-item-delete" 
                    title={activeFolder === 'trash' ? 'Definitivně smazat' : 'Přesunout do koše'}
                  >
                    🗑️
                  </button>
                  {!msg.read && <span className="blue-unread-dot"></span>}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. Pravý panel (Mail Reader) */}
      <section className="email-reader-pane">
        {selectedMessage ? (
          <div className="email-reader-content animate-fade-in">
            {/* Hlavička zprávy */}
            <header className="reader-header">
              <h2 className="reader-subject">{selectedMessage.subject}</h2>
              
              <div className="reader-sender-row">
                <div 
                  className="reader-avatar" 
                  style={{ background: getAvatarGradient(selectedMessage.from) }}
                >
                  {getInitials(selectedMessage.from)}
                </div>
                
                <div className="reader-sender-details">
                  <div className="sender-name-box">
                    <span className="sender-full">{selectedMessage.from}</span>
                  </div>
                  <div className="recipient-info">
                    Komu: <span className="recipient-email">{selectedMessage.to || user?.email || 'vás'}</span>
                  </div>
                </div>

                <div className="reader-time">
                  {new Date(selectedMessage.date).toLocaleString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Rychlé akce v readeru */}
              <div className="reader-action-toolbar">
                {activeFolder !== 'trash' && (
                  <button onClick={handleReply} className="btn-reader-action">
                    ↩️ Odpovědět
                  </button>
                )}
                <button 
                  onClick={(e) => handleDeleteMessage(e, selectedMessage.id)} 
                  className="btn-reader-action delete-accent"
                >
                  🗑️ Smazat
                </button>
              </div>
            </header>

            {/* Tělo zprávy */}
            <main className="reader-body-scrollable">
              {isLoading && !selectedMessage.body ? (
                <div className="reader-loading">Stahuji obsah zprávy...</div>
              ) : selectedMessage.body ? (
                <div 
                  className="reader-body-text" 
                  dangerouslySetInnerHTML={{
                    __html: selectedMessage.body.includes('<br') || selectedMessage.body.includes('<p')
                      ? selectedMessage.body 
                      : selectedMessage.body.replace(/\n/g, '<br />')
                  }}
                />
              ) : (
                <div className="reader-body-text italic text-muted">(Zpráva nemá žádný obsah)</div>
              )}
            </main>
          </div>
        ) : (
          /* Prázdný stav */
          <div className="email-reader-empty">
            <div className="empty-glow-icon">📧</div>
            <h3>E-mailová schránka Canvas OS</h3>
            <p>Vyberte zprávu v seznamu k zobrazení jejího plného obsahu a podrobností.</p>
            <div className="empty-stats-grid">
              <div className="stat-card">
                <span className="stat-val">{messages.length}</span>
                <span className="stat-lbl">Celkem zpráv</span>
              </div>
              <div className="stat-card">
                <span className="stat-val" style={{ color: '#ef4444' }}>{unreadInboxCount}</span>
                <span className="stat-lbl">Nepřečteno</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Compose Modal Overlay */}
      {isComposeOpen && (
        <div className="email-compose-overlay">
          <div className="email-compose-modal animate-scale-up">
            <header className="compose-modal-header">
              <h3>Nová zpráva</h3>
              <button onClick={() => setIsComposeOpen(false)} className="btn-close-compose">×</button>
            </header>

            <form onSubmit={handleSendEmail} className="compose-modal-form">
              <div className="compose-form-row">
                <label htmlFor="compose-to">Příjemce:</label>
                <input
                  id="compose-to"
                  type="email"
                  required
                  placeholder="např. tomas@propoj.app"
                  value={composeTo}
                  onChange={e => setComposeTo(e.target.value)}
                  className="compose-input"
                />
              </div>

              <div className="compose-form-row">
                <label htmlFor="compose-subject">Předmět:</label>
                <input
                  id="compose-subject"
                  type="text"
                  required
                  placeholder="Předmět e-mailu"
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  className="compose-input"
                />
              </div>

              <div className="compose-form-body">
                <textarea
                  required
                  placeholder="Napište svou zprávu..."
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  className="compose-textarea"
                />
              </div>

              <footer className="compose-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsComposeOpen(false)} 
                  className="btn-compose-cancel"
                >
                  Zrušit
                </button>
                <button 
                  type="submit" 
                  disabled={isSending} 
                  className="btn-compose-send"
                >
                  {isSending ? 'Odesílám...' : '🚀 Odeslat e-mail'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
