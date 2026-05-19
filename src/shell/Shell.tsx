import React, { useState, useEffect } from 'react';
import Desktop from './Desktop/Desktop';
import Taskbar from './Taskbar/Taskbar';
import CommandBar from './CommandBar/CommandBar';
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="os-shell">
      <Desktop />
      <Taskbar />
      {commandBarOpen && <CommandBar onClose={() => setCommandBarOpen(false)} />}
    </div>
  );
}
