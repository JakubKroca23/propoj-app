import React from 'react';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import TaskbarClock from './TaskbarClock';
import TaskbarUserMenu from './TaskbarUserMenu';
import { useWindowStore } from '@/stores/windowStore';
import './Taskbar.css';

export default function Taskbar() {
  const { windows } = useWindowStore();

  return (
    <div className="os-taskbar">
      <div className="taskbar-left">
        <WorkspaceSwitcher />
        <div className="taskbar-windows-list">
          {windows.map((win) => (
            <button
              key={win.id}
              type="button"
              className={`taskbar-win-btn ${!win.isMinimized ? 'active' : ''}`}
              onClick={() => {
                console.log('window clicked:', win.id);
              }}
            >
              <span>{win.icon}</span>
              <span className="truncate">{win.title}</span>
            </button>
          ))}
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
