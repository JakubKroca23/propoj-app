import React from 'react';
import GlitchText from '@/components/ui/GlitchText';

// Minimal landing-page top bar: just branding to keep landing page clean
const Topbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-10 border-b border-border bg-background/40">
      <div className="flex items-center h-full px-4">
        <GlitchText text="PROPOJ.APP" className="gradient-text text-glow block" />
      </div>
    </header>
  );
};

export default Topbar;
