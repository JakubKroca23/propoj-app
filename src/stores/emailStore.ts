import { create } from 'zustand';
import { databases, functions } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { DATABASE_ID, COLLECTION_PREFERENCES } from '@/lib/dbSetup';

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body?: string;
  read: boolean;
  folder: 'inbox' | 'sent' | 'trash';
}

export interface EmailAccountConfig {
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  username: string;
  password?: string;
}

interface EmailState {
  messages: EmailMessage[];
  selectedMessage: EmailMessage | null;
  activeFolder: 'inbox' | 'sent' | 'trash';
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  accountConfig: EmailAccountConfig | null;
  
  loadConfig: (userId: string) => Promise<void>;
  saveAccountConfig: (config: EmailAccountConfig, userId: string) => Promise<void>;
  clearAccountConfig: (userId: string) => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  fetchMessageBody: (messageId: string, userId: string) => Promise<void>;
  sendEmail: (to: string, subject: string, body: string, userId: string) => Promise<void>;
  deleteMessage: (messageId: string, userId: string) => Promise<void>;
  toggleReadStatus: (messageId: string, userId: string, read: boolean) => Promise<void>;
  setActiveFolder: (folder: 'inbox' | 'sent' | 'trash') => void;
  setSelectedMessage: (msg: EmailMessage | null) => void;
}

const EMAIL_FUNCTION_ID = 'email-proxy';
const LOCAL_STORAGE_KEY = 'canvas_os_mock_emails';

// Výchozí mock zprávy
const getInitialMockEmails = (): EmailMessage[] => [
  {
    id: 'mock-mail-1',
    subject: 'Vítejte v systému propoj.app Canvas OS!',
    from: 'Antigravity Team <support@propoj.app>',
    to: 'Jakub Kroča <jakub@propoj.app>',
    date: new Date().toISOString(),
    read: false,
    folder: 'inbox',
    body: `Ahoj Jakube,

gratulujeme k úspěšné inicializaci Canvas OS! Tvoje pracovní prostředí je plně připraveno.

Můžeš začít spravovat soubory, psát poznámky a plánovat události v Kalendáři.
Vyzkoušej také aplikaci Finance pro vizuální sledování rozpočtu a live widgety na ploše.

S pozdravem,
Tým Antigravity`
  },
  {
    id: 'mock-mail-2',
    subject: 'Zpráva ze serveru: Databáze synchronizována',
    from: 'Appwrite Cloud <noreply@appwrite.propoj.app>',
    to: 'Jakub Kroča <jakub@propoj.app>',
    date: new Date(Date.now() - 3600000 * 3).toISOString(), // před 3 hodinami
    read: true,
    folder: 'inbox',
    body: `Dobrý den,

oznamujeme vám, že všechny kolekce (Poznámky, Úkoly, Kalendář, Finance) byly úspěšně inicializovány na vašem cloudu.

Projekt ID: 69effdf6003ce697ee83
API Endpoint: https://appwrite.propoj.app/v1
Stav databáze: Synchronizováno, 0 chyb.

Děkujeme, že používáte naše cloudové služby pro propoj.app.`
  },
  {
    id: 'mock-mail-3',
    subject: 'Návrhy glassmorphic designu pro aplikaci Finance',
    from: 'Kreativní Studio <design@propoj.app>',
    to: 'Jakub Kroča <jakub@propoj.app>',
    date: new Date(Date.now() - 86400000).toISOString(), // včera
    read: true,
    folder: 'inbox',
    body: `Ahoj Jakube,

posílám ti nové SVG ikony a barevné palety pro naši aplikaci Finance. 
Grafy vypadají naprosto skvěle a glassmorphic efekt je na moderních monitorech dokonale plynulý.

Barvy:
- Příjmy: #10B981 (Emerald)
- Výdaje: #EF4444 (Rose)
- Podklad: rgba(255, 255, 255, 0.03) s rozostřením pozadí 12px.

Dej mi vědět, jestli můžeme přejít k implementaci Fáze 5!

Marek`
  },
  {
    id: 'mock-mail-4',
    subject: 'Potvrzení objednávky serveru VPS propoj.app',
    from: 'Fakturační oddělení <billing@propoj.app>',
    to: 'Jakub Kroča <jakub@propoj.app>',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    read: true,
    folder: 'inbox',
    body: `Vážený zákazníku,

děkujeme za vaši objednávku hostingu VPS Server Cloud L. 
Platba byla úspěšně zpracována a server je plně konfigurován.

Fakturovaná částka: 349 Kč / měsíc
Způsob platby: Kreditní karta (končící 4242)

Podrobnosti o přihlášení naleznete v administračním rozhraní.

S přátelským pozdravem,
Fakturační oddělení propoj.app`
  }
];

const getStoredEmails = (): EmailMessage[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('[Email Store] Chyba při čtení e-mailů z localStorage, obnovuji výchozí.');
    }
  }
  const defaults = getInitialMockEmails();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveEmailsToStorage = (emails: EmailMessage[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emails));
};

export const useEmailStore = create<EmailState>((set, get) => ({
  messages: [],
  selectedMessage: null,
  activeFolder: 'inbox',
  isLoading: false,
  isConnected: false,
  error: null,
  accountConfig: null,

  loadConfig: async (userId) => {
    try {
      // 1. Zkusíme načíst z Appwrite preferences
      const prefResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_PREFERENCES,
        [Query.equal('userId', userId)]
      );

      if (prefResult.documents.length > 0) {
        const doc = prefResult.documents[0];
        if (doc.emailConfig) {
          try {
            const config = JSON.parse(doc.emailConfig) as EmailAccountConfig;
            set({ accountConfig: config, isConnected: true });
            return;
          } catch (e) {
            console.error('[Email Store] Chyba při parsování emailConfig z DB:', e);
          }
        }
      }
    } catch (err) {
      console.warn('[Email Store] Nepodařilo se načíst konfiguraci z Appwrite DB, zkouším localStorage.');
    }

    // 2. Fallback na localStorage
    const local = localStorage.getItem(`canvas_os_email_config_${userId}`);
    if (local) {
      try {
        const config = JSON.parse(local) as EmailAccountConfig;
        set({ accountConfig: config, isConnected: true });
      } catch (e) {
        set({ accountConfig: null, isConnected: false });
      }
    }
  },

  saveAccountConfig: async (config, userId) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Zkusíme uložit do Appwrite Preferences
      const prefResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_PREFERENCES,
        [Query.equal('userId', userId)]
      );

      if (prefResult.documents.length > 0) {
        const doc = prefResult.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_PREFERENCES,
          doc.$id,
          { emailConfig: JSON.stringify(config) }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_PREFERENCES,
          'unique()',
          {
            userId,
            emailConfig: JSON.stringify(config)
          }
        );
      }
      
      localStorage.setItem(`canvas_os_email_config_${userId}`, JSON.stringify(config));
      set({ accountConfig: config, isConnected: true, isLoading: false });
      
      // Po uložení zkusíme načíst zprávy
      await get().loadMessages(userId);
    } catch (err: any) {
      console.warn('[Email Store] Chyba při ukládání do DB, ukládám lokálně.', err);
      // Fallback uložení do localStorage
      localStorage.setItem(`canvas_os_email_config_${userId}`, JSON.stringify(config));
      set({ accountConfig: config, isConnected: true, isLoading: false });
      await get().loadMessages(userId);
    }
  },

  clearAccountConfig: async (userId) => {
    set({ isLoading: true });
    try {
      const prefResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_PREFERENCES,
        [Query.equal('userId', userId)]
      );

      if (prefResult.documents.length > 0) {
        const doc = prefResult.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_PREFERENCES,
          doc.$id,
          { emailConfig: '' }
        );
      }
    } catch (e) {
      console.warn('[Email Store] Odpojení účtu v DB selhalo, mažu pouze lokálně.');
    }

    localStorage.removeItem(`canvas_os_email_config_${userId}`);
    // Smažeme také stažené zprávy a resetujeme
    set({ accountConfig: null, isConnected: false, messages: getStoredEmails(), selectedMessage: null, isLoading: false });
  },

  loadMessages: async (userId) => {
    set({ isLoading: true, error: null });
    const { accountConfig } = get();

    // Pokud nemáme reálnou konfiguraci, automaticky pracujeme s mock emaily
    if (!accountConfig || !accountConfig.imapHost) {
      const mockMails = getStoredEmails();
      set({ messages: mockMails, isLoading: false });
      return;
    }

    try {
      const payload = {
        action: 'listMessages',
        config: accountConfig
      };

      const res = await functions.createExecution(EMAIL_FUNCTION_ID, JSON.stringify(payload));
      const responseData = JSON.parse((res as any).responseBody || (res as any).response || '{}');

      if (responseData.success && responseData.messages) {
        const fetchedMessages = responseData.messages.map((m: any) => ({
          id: m.id,
          subject: m.subject,
          from: m.from,
          to: m.to,
          date: m.date,
          read: m.read,
          folder: 'inbox' as const
        }));
        set({ messages: fetchedMessages, isLoading: false });
      } else {
        throw new Error(responseData.error || 'Neznámá chyba proxy serveru.');
      }
    } catch (err: any) {
      console.warn('[Email Store] Selhalo stažení reálných e-mailů přes Appwrite, načítám mock data.', err);
      // Fallback na mock
      const mockMails = getStoredEmails();
      set({ 
        messages: mockMails, 
        isLoading: false, 
        error: `Nepodařilo se připojit k mail serveru (${err.message}). Zobrazuji zkušební e-maily.` 
      });
    }
  },

  fetchMessageBody: async (messageId, userId) => {
    const { accountConfig, messages } = get();
    
    // Pro mock e-maily máme těla zpráv přímo v datech
    if (messageId.startsWith('mock-')) {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        set({ selectedMessage: msg });
      }
      return;
    }

    if (!accountConfig) return;

    set({ isLoading: true });
    try {
      const payload = {
        action: 'getMessage',
        config: accountConfig,
        params: { messageId }
      };

      const res = await functions.createExecution(EMAIL_FUNCTION_ID, JSON.stringify(payload));
      const responseData = JSON.parse((res as any).responseBody || (res as any).response || '{}');

      if (responseData.success) {
        const bodyContent = responseData.html || responseData.body || 'Zpráva nemá žádný obsah.';
        set((state) => {
          const updated = state.messages.map(m => m.id === messageId ? { ...m, body: bodyContent, read: true } : m);
          const currentSelected = updated.find(m => m.id === messageId) || null;
          return {
            messages: updated,
            selectedMessage: currentSelected,
            isLoading: false
          };
        });
      } else {
        throw new Error(responseData.error);
      }
    } catch (err: any) {
      console.error('[Email Store] Selhalo stažení těla e-mailu:', err);
      set({ 
        isLoading: false, 
        error: `Nepodařilo se stáhnout detail e-mailu: ${err.message}` 
      });
    }
  },

  sendEmail: async (to, subject, body, userId) => {
    set({ isLoading: true, error: null });
    const { accountConfig } = get();

    // Mock odesílání
    if (!accountConfig || !accountConfig.smtpHost) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulace zpoždění sítě
      
      const newMockMail: EmailMessage = {
        id: `mock-mail-${Date.now()}`,
        subject,
        from: accountConfig?.username || 'Jakub Kroča <jakub@propoj.app>',
        to,
        date: new Date().toISOString(),
        read: true,
        folder: 'sent',
        body
      };

      const currentMails = [newMockMail, ...getStoredEmails()];
      saveEmailsToStorage(currentMails);
      
      set((state) => ({
        messages: [newMockMail, ...state.messages],
        isLoading: false
      }));
      return;
    }

    try {
      const payload = {
        action: 'sendMessage',
        config: accountConfig,
        params: { to, subject, body }
      };

      const res = await functions.createExecution(EMAIL_FUNCTION_ID, JSON.stringify(payload));
      const responseData = JSON.parse((res as any).responseBody || (res as any).response || '{}');

      if (responseData.success) {
        // Vytvoříme lokální kopii v odeslaných zprávách
        const newSentMail: EmailMessage = {
          id: responseData.messageId || `sent-${Date.now()}`,
          subject,
          from: accountConfig.username,
          to,
          date: new Date().toISOString(),
          read: true,
          folder: 'sent',
          body
        };
        set((state) => ({
          messages: [newSentMail, ...state.messages],
          isLoading: false
        }));
      } else {
        throw new Error(responseData.error);
      }
    } catch (err: any) {
      console.error('[Email Store] Odeslání e-mailu selhalo:', err);
      set({ isLoading: false, error: `Selhalo odeslání e-mailu: ${err.message}` });
      throw err;
    }
  },

  deleteMessage: async (messageId, userId) => {
    // Pro mock i real e-maily pracujeme lokálně se stavem složek (přesun do Koše / smazání)
    set((state) => {
      const updatedMessages = state.messages.map(m => {
        if (m.id === messageId) {
          if (m.folder === 'trash') {
            // Definitivní smazání
            return null;
          } else {
            // Přesun do koše
            return { ...m, folder: 'trash' as const };
          }
        }
        return m;
      }).filter((m): m is EmailMessage => m !== null);

      if (messageId.startsWith('mock-')) {
        saveEmailsToStorage(updatedMessages);
      }

      return {
        messages: updatedMessages,
        selectedMessage: state.selectedMessage?.id === messageId ? null : state.selectedMessage
      };
    });
  },

  toggleReadStatus: async (messageId, userId, read) => {
    set((state) => {
      const updated = state.messages.map(m => m.id === messageId ? { ...m, read } : m);
      
      if (messageId.startsWith('mock-')) {
        saveEmailsToStorage(updated);
      }

      return {
        messages: updated,
        selectedMessage: state.selectedMessage?.id === messageId ? { ...state.selectedMessage, read } : state.selectedMessage
      };
    });
  },

  setActiveFolder: (folder) => set({ activeFolder: folder, selectedMessage: null }),
  setSelectedMessage: (msg) => set({ selectedMessage: msg })
}));
