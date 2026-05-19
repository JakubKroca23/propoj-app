import React, { useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { AppWindow } from '@/types';
import { useWindowStore } from '@/stores/windowStore';
import { clampPosition } from '@/utils/windowUtils';
import WindowHeader from './WindowHeader';
import { APPS } from '@/data/apps';
import IframeLoader from './IframeLoader';
import './Window.css';

interface WindowProps {
  window: AppWindow;
}

export default function Window({ window: win }: WindowProps) {
  const windowStore = useWindowStore();
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Najdeme příslušnou aplikaci v registru pro dynamic component rendering
  const appDef = APPS.find((a) => a.id === win.appId);
  const AppComponent = appDef?.component;

  const bindDrag = useDrag(
    ({ offset: [x, y], first, last }) => {
      if (win.isMaximized) return;

      if (first) {
        windowStore.setIsDragging(true);
        windowStore.focusWindow(win.id);
      }
      if (last) {
        windowStore.setIsDragging(false);
      }

      const clamped = clampPosition(x, y, win.width, win.height);
      windowStore.updatePosition(win.id, clamped.x, clamped.y);
    },
    {
      from: () => [win.x, win.y],
      bounds: {
        left: 0,
        top: 0,
        right: window.innerWidth - win.width,
        bottom: window.innerHeight - win.height - 56,
      },
    }
  );

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    windowStore.focusWindow(win.id);

    const startWidth = win.width;
    const startHeight = win.height;
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));

      const maxW = window.innerWidth - win.x;
      const maxH = window.innerHeight - win.y - 56;

      windowStore.updateSize(
        win.id,
        Math.min(newWidth, maxW),
        Math.min(newHeight, maxH)
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (win.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      className={`os-window ${win.isMaximized ? 'maximized' : ''} ${
        win.isMinimized ? 'minimized' : ''
      }`}
      style={{
        left: win.isMaximized ? 0 : win.x,
        top: win.isMaximized ? 0 : win.y,
        width: win.isMaximized ? '100vw' : win.width,
        height: win.isMaximized ? 'calc(100vh - 56px)' : win.height,
        zIndex: win.zIndex,
      }}
      onClick={() => windowStore.focusWindow(win.id)}
    >
      <div {...(win.isMaximized ? {} : bindDrag())}>
        <WindowHeader
          window={win}
          onClose={() => windowStore.closeWindow(win.id)}
          onMinimize={() => windowStore.minimizeWindow(win.id)}
          onMaximize={() => windowStore.maximizeWindow(win.id)}
        />
      </div>

      <div
        className="window-content"
        style={{ padding: (win.url || AppComponent) ? 0 : '18px' }}
      >
        {AppComponent ? (
          <React.Suspense fallback={
            <div className="app-loading-fallback animate-fade-in">
              <div className="spinner"></div>
              <span>Načítání aplikace...</span>
            </div>
          }>
            <AppComponent window={win} />
          </React.Suspense>
        ) : win.url ? (
          <IframeLoader url={win.url} windowId={win.id} token={win.token || ''} />
        ) : (
          <div className="window-placeholder">
            <div className="window-placeholder-icon">{win.icon}</div>
            <h3 className="window-placeholder-title">{win.title}</h3>
            <p className="window-placeholder-desc">
              Aplikace {win.title} bude plně integrována ve Fázi 3.
            </p>
          </div>
        )}
      </div>

      {!win.isMaximized && (
        <div className="resize-handle-se" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  );
}

