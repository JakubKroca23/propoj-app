import React from 'react';

const HudOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Skenovací linka - ponechána pro texturu */}
      <div className="scanline opacity-20" />
    </div>
  );
};

export default HudOverlay;
