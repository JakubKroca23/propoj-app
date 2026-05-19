import React from 'react';
import { useWindowStore } from '@/stores/windowStore';
import Window from './Window';
import './WindowManager.css';

export default function WindowManager() {
  const { windows, isDragging } = useWindowStore();

  return (
    <div className="os-window-manager">
      {isDragging && <div className="drag-overlay" />}
      {windows.map((win) => (
        <Window key={win.id} window={win} />
      ))}
    </div>
  );
}
