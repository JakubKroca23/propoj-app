import React from 'react';
import { APPS } from '@/data/apps';
import AppTile from './AppTile';
import './BentoLauncher.css';

export default function BentoLauncher() {
  const handleAppClick = (appId: string) => {
    console.log('open app:', appId);
  };

  return (
    <div className="bento-launcher">
      {APPS.map((app, index) => (
        <AppTile
          key={app.id}
          app={app}
          index={index}
          onClick={() => handleAppClick(app.id)}
        />
      ))}
    </div>
  );
}
