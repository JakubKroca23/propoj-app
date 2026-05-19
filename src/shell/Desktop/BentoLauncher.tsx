import React from 'react';
import { APPS } from '@/data/apps';
import AppTile from './AppTile';
import { useWindowStore } from '@/stores/windowStore';
import './BentoLauncher.css';

export default function BentoLauncher() {
  const { openWindow } = useWindowStore();

  const handleAppClick = (appId: string) => {
    const app = APPS.find((a) => a.id === appId);
    if (app) {
      openWindow(app);
    }
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
