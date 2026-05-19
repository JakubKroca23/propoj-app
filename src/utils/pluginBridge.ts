import { useWindowStore } from '@/stores/windowStore';

export interface PluginMessage {
  windowId: string;
  token: string;
  action: string;
  payload?: any;
  requestId?: string;
}

/**
 * Zpracuje požadavky poslané z iframe pluginu přes postMessage.
 * Volá se pouze pokud byl token a windowId úspěšně verifikován.
 */
export function handlePluginAction(message: PluginMessage, sourceWindow: Window) {
  const { action, payload, windowId, requestId } = message;
  const windowStore = useWindowStore.getState();

  // Najdeme okno, ze kterého zpráva přišla, abychom znali appId aplikace
  const win = windowStore.windows.find((w) => w.id === windowId);
  if (!win) {
    console.error(`[Plugin Bridge] Nenalezeno okno pro ID: ${windowId}`);
    return;
  }

  const appId = win.appId;

  console.log(`[Plugin Bridge] Přijata akce "${action}" pro aplikaci "${appId}" (okno ${windowId})`);

  switch (action) {
    case 'canvas-os:notification': {
      const text = payload?.message || 'Zpráva z pluginu';
      const title = win.title || 'Plugin';

      // Zkusíme odeslat HTML5 systémovou notifikaci
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body: text, icon: win.icon });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(title, { body: text, icon: win.icon });
            }
          });
        }
      }
      
      // Vždy zalogujeme a zobrazíme fallback konzolovou notifikaci
      console.log(`[Plugin Notification] ${title}: ${text}`);
      break;
    }

    case 'canvas-os:openWindow': {
      if (payload && payload.id && payload.name) {
        // Povolíme otevírání dalších aplikací
        windowStore.openWindow({
          id: payload.id,
          name: payload.name,
          icon: payload.icon || '🧩',
          description: payload.description || '',
          color: payload.color || '#8B5CF6',
          size: payload.size || 'md',
          url: payload.url,
        });
      }
      break;
    }

    case 'canvas-os:closeWindow': {
      // Zavře buď sebe, nebo specifikované okno
      const targetWindowId = payload?.windowId || windowId;
      windowStore.closeWindow(targetWindowId);
      break;
    }

    case 'canvas-os:storage:set': {
      if (payload && payload.key) {
        try {
          const storageKey = `canvas-os:plugin:${appId}:${payload.key}`;
          localStorage.setItem(storageKey, JSON.stringify(payload.value));
          
          // Odešleme odpověď zpět do iframe
          if (requestId) {
            sendResponseToIframe(sourceWindow, {
              requestId,
              success: true,
            });
          }
        } catch (error: any) {
          console.error('[Plugin Bridge] Selhalo uložení do storage:', error);
          if (requestId) {
            sendResponseToIframe(sourceWindow, {
              requestId,
              success: false,
              error: error.message,
            });
          }
        }
      }
      break;
    }

    case 'canvas-os:storage:get': {
      if (payload && payload.key) {
        try {
          const storageKey = `canvas-os:plugin:${appId}:${payload.key}`;
          const val = localStorage.getItem(storageKey);
          const parsedValue = val ? JSON.parse(val) : null;
          
          if (requestId) {
            sendResponseToIframe(sourceWindow, {
              requestId,
              success: true,
              payload: parsedValue,
            });
          }
        } catch (error: any) {
          console.error('[Plugin Bridge] Selhalo načtení ze storage:', error);
          if (requestId) {
            sendResponseToIframe(sourceWindow, {
              requestId,
              success: false,
              error: error.message,
            });
          }
        }
      }
      break;
    }

    default:
      console.warn(`[Plugin Bridge] Neznámá akce: ${action}`);
  }
}

/**
 * Pomocná funkce pro odeslání asynchronní odpovědi zpět do iframe pluginu
 */
function sendResponseToIframe(sourceWindow: Window, data: any) {
  try {
    sourceWindow.postMessage(
      {
        action: 'canvas-os:response',
        ...data,
      },
      '*'
    );
  } catch (error) {
    console.error('[Plugin Bridge] Nepodařilo se poslat odpověď do iframe:', error);
  }
}
