import React from 'react';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import TaskbarClock from './TaskbarClock';
import TaskbarUserMenu from './TaskbarUserMenu';
import { useWindowStore } from '@/stores/windowStore';
import './Taskbar.css';

export default function Taskbar() {
  const { windows, restoreWindow, minimizeWindow, focusWindow } = useWindowStore();

  const handleWindowClick = (id: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(id);
    } else {
      const currentWindow = windows.find((w) => w.id === id);
      const isFocused = currentWindow
        ? currentWindow.zIndex === Math.max(...windows.map((w) => w.zIndex))
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
      <div className="taskbar-left">
        <WorkspaceSwitcher />
        <div className="taskbar-windows-list">
          {windows.map((win) => {
            const isActive = !win.isMinimized;
            return (
              <button
                key={win.id}
                type="button"
                className={`taskbar-win-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleWindowClick(win.id, win.isMinimized)}
              >
                <span>{win.icon}</span>
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="taskbar-center">
        <TaskbarClock />
      </div>

      <div className="taskbar-right">
        <TaskbarUserMenu />
      </div>
    </div>
  );
}
