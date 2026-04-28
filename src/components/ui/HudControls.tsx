import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Mail, Circle } from 'lucide-react';

interface HudControlsProps {
  onOpenPortfolio: () => void;
  onOpenContact: () => void;
}

const HudControls: React.FC<HudControlsProps> = ({ onOpenPortfolio, onOpenContact }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[9000] flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute w-32 h-32 bg-cyber-neon/10 blur-3xl rounded-full animate-pulse" />

      {/* Main Circle HUD */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer rotating ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-cyber-neon/20 rounded-full"
        />
        
        {/* Inner static ring */}
        <div className="absolute inset-2 border border-white/5 rounded-full" />

        {/* Portfolio Button (Left Segment) */}
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenPortfolio}
          className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
          aria-label="Open Portfolio"
        >
          <div className="p-3 bg-slate-900/80 border border-cyber-neon/40 rounded-full text-cyber-neon shadow-[0_0_15px_rgba(0,255,163,0.3)] group-hover:shadow-[0_0_25px_rgba(0,255,163,0.5)] transition-all">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-cyber-neon transition-colors">Portfolio</span>
        </motion.button>

        {/* Contact Button (Top Segment) */}
        <motion.button
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenContact}
          className="absolute left-1/2 -top-12 -translate-x-1/2 flex flex-col items-center gap-1 group"
          aria-label="Open Contact"
        >
          <div className="p-3 bg-slate-900/80 border border-cyber-purple/40 rounded-full text-cyber-purple shadow-[0_0_15px_rgba(157,0,255,0.3)] group-hover:shadow-[0_0_25px_rgba(157,0,255,0.5)] transition-all">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-cyber-purple transition-colors">Kontakt</span>
        </motion.button>

        {/* Center Decorative Core */}
        <div className="relative w-12 h-12 flex items-center justify-center">
            <Circle className="w-8 h-8 text-white/10 animate-pulse" />
            <div className="absolute w-2 h-2 bg-cyber-neon rounded-full shadow-[0_0_10px_#00ffa3]" />
        </div>

        {/* Scanning Line Decoration */}
        <motion.div 
            animate={{ y: [0, 40, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-2 left-0 w-full h-[1px] bg-cyber-neon/30 blur-[1px]"
        />
      </div>
    </div>
  );
};

export default HudControls;
