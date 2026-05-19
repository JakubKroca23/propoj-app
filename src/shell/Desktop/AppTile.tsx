import React from 'react';
import { BentoTile } from '@/stores/bentoStore';
import './AppTile.css';

interface AppTileProps {
  app: BentoTile;
  onClick: () => void;
  index: number;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}

export default function AppTile({
  app,
  onClick,
  index,
  draggable,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  className = '',
}: AppTileProps) {
  const glowColor = `${app.color}33`;

  const tileStyle = {
    '--tile-color': app.color,
    '--tile-glow-color': glowColor,
    animationDelay: `${index * 40}ms`,
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className={`app-tile size-${app.size} animate-scale-in ${className}`}
      style={tileStyle}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <div className="app-tile-icon-wrapper">
        <span className="app-tile-icon">{app.icon}</span>
      </div>
      {app.size !== 'sm' ? (
        <div className="app-tile-info">
          <span className="app-tile-name">{app.name}</span>
          <span className="app-tile-desc">{app.description}</span>
        </div>
      ) : (
        <span className="app-tile-name text-sm">{app.name}</span>
      )}
    </button>
  );
}
