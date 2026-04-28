import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HudOverlay from '@/components/hud/HudOverlay';
import Hero from '@/components/sections/Hero';
import PortfolioShowcase from '@/components/sections/PortfolioShowcase';

const LandingPage: React.FC = () => {
  const [isBooted, setIsBooted] = useState(false);

  const handleBoot = () => {
    setIsBooted(true);
  };

  return (
    <main className="bg-slate-950 min-h-screen text-white relative overflow-hidden">
      <HudOverlay />
      
      <AnimatePresence mode="wait">
        {!isBooted ? (
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.1,
              filter: 'blur(20px)',
              transition: { duration: 1.5, ease: "circIn" }
            }}
          >
            <Hero onEnter={handleBoot} />
          </motion.div>
        ) : (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { delay: 0.5, duration: 1, ease: "circOut" }
            }}
            className="relative z-10"
          >
            <PortfolioShowcase onBack={() => setIsBooted(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
      </div>
    </main>
  );
};

export default LandingPage;
