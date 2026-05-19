import React from 'react';
import { AppWindow } from '@/types';

interface WindowHeaderProps {
  window: AppWindow;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

export default function WindowHeader({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
}: WindowHeaderProps) {
  return (
    <div className="window-header flex items-center justify-between no-select">
      <div className="flex items-center gap-2 font-medium" style={{ paddingLeft: '16px' }}>
        <span className="text-base">{win.icon}</span>
        <span className="text-xs font-semibold text-primary">{win.title}</span>
      </div>

      <div className="window-controls flex items-center gap-2" style={{ paddingRight: '16px' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className="win-control-btn minimize"
          title="Minimalizovat"
          aria-label="Minimize"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          className="win-control-btn maximize"
          title="Maximalizovat"
          aria-label="Maximize"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="win-control-btn close"
          title="Zavřít"
          aria-label="Close"
        />
      </div>
    </div>
  );
}
