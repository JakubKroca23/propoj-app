import React, { useState, useEffect } from 'react';
import Desktop from './Desktop/Desktop';
import Taskbar from './Taskbar/Taskbar';
import CommandBar from './CommandBar/CommandBar';
import { useWindowStore } from '@/stores/windowStore';
import { handlePluginAction, PluginMessage } from '@/utils/pluginBridge';
import './Shell.css';

export default function Shell() {
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandBarOpen((v) => !v);
      }
    };

    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (
        data &&
        typeof data === 'object' &&
        'windowId' in data &&
        'token' in data &&
        'action' in data
      ) {
        const msg = data as PluginMessage;
        
        // Vyhledáme okno a ověříme bezpečnostní token
        const windowStore = useWindowStore.getState();
        const win = windowStore.windows.find((w) => w.id === msg.windowId);
        
        if (win && win.token && win.token === msg.token) {
          // Handshake úspěšný, předáme zprávu do bridge
          handlePluginAction(msg, e.source as Window);
        } else {
          console.warn(
            '[Plugin Security] Zablokován neautorizovaný pokus o volání API Bridge!',
            'Očekávané okno nebo token nesouhlasí.',
            msg
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="os-shell">
      <Desktop />
      <Taskbar />
      {commandBarOpen && <CommandBar onClose={() => setCommandBarOpen(false)} />}
    </div>
  );
}
