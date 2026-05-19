import React, { useEffect, useState } from 'react';
import AppTile from './AppTile';
import { useWindowStore } from '@/stores/windowStore';
import { useBentoStore } from '@/stores/bentoStore';
import { useAuthStore } from '@/stores/authStore';
import './BentoLauncher.css';

export default function BentoLauncher() {
  const { openWindow } = useWindowStore();
  const { user } = useAuthStore();
  const { tiles, loadBentoData, updateTileOrder, isLoading } = useBentoStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user?.$id) {
      loadBentoData(user.$id);
    }
  }, [user?.$id, loadBentoData]);

  const handleAppClick = (tileId: string) => {
    const tile = tiles.find((t) => t.id === tileId);
    if (tile) {
      openWindow(tile);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Nutné pro povolení dropu
    if (draggedIndex !== null && draggedIndex !== index) {
      setDraggedOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (user?.$id && !isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      updateTileOrder(sourceIndex, targetIndex, user.$id);
    }
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  if (isLoading && tiles.length === 0) {
    return (
      <div className="bento-loading" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
        Načítání launcheru...
      </div>
    );
  }

  return (
    <div className="bento-launcher">
      {tiles.map((tile, index) => (
        <AppTile
          key={tile.id}
          app={tile}
          index={index}
          onClick={() => handleAppClick(tile.id)}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`${draggedIndex === index ? 'dragging' : ''} ${
            draggedOverIndex === index ? 'drag-over' : ''
          }`}
        />
      ))}
    </div>
  );
}
