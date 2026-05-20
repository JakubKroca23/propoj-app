import React from 'react';
import TaskbarClock from './TaskbarClock';
import TaskbarUserMenu from './TaskbarUserMenu';
import { useWindowStore } from '@/stores/windowStore';
import './Taskbar.css';

export default function Taskbar() {
  const { windows, restoreWindow, minimizeWindow, focusWindow } = useWindowStore();

  const activeZIndex = windows.length > 0 ? Math.max(...windows.map((w) => w.zIndex)) : 0;

  const handleWindowClick = (id: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(id);
    } else {
      const currentWindow = windows.find((w) => w.id === id);
      const isFocused = currentWindow
        ? currentWindow.zIndex === activeZIndex
        : false;

      if (isFocused) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    }
  };

  return (
    <div className="os-taskbar">
      <div className="taskbar-windows-list">
        {windows.map((win) => {
          const isFocused = !win.isMinimized && win.zIndex === activeZIndex;
          const className = `taskbar-win-btn ${
            win.isMinimized ? 'is-minimized' : 'is-active'
          } ${isFocused ? 'has-focus' : ''}`;

          return (
            <button
              key={win.id}
              type="button"
              className={className}
              onClick={() => handleWindowClick(win.id, win.isMinimized)}
              title={win.title}
              aria-label={win.title}
            >
              <span className="taskbar-icon">{win.icon}</span>
            </button>
          );
        })}
      </div>

      {windows.length > 0 && <div className="taskbar-divider" />}

      <div className="taskbar-widgets">
        <TaskbarClock />
        <TaskbarUserMenu />
      </div>
    </div>
  );
}

