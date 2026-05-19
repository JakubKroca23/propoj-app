import React from 'react';
import { AppDefinition } from '@/data/apps';
import './AppTile.css';

interface AppTileProps {
  app: AppDefinition;
  onClick: () => void;
  index: number;
}

export default function AppTile({ app, onClick, index }: AppTileProps) {
  const glowColor = `${app.color}33`;

  const tileStyle = {
    '--tile-color': app.color,
    '--tile-glow-color': glowColor,
    animationDelay: `${index * 40}ms`,
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className={`app-tile size-${app.size} animate-scale-in`}
      style={tileStyle}
      onClick={onClick}
    >
      <div className="app-tile-icon">{app.icon}</div>
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
