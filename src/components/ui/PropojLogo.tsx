import React from 'react';
import { motion } from 'framer-motion';
import GlitchText from './GlitchText';

const PropojLogo: React.FC = () => {
  return (
    <div className="relative inline-flex items-center justify-center" aria-label="PROPOJ.APP Logo">
      {/* Levý kabel */}
      <svg 
        className="absolute -left-28 w-28 h-12 pointer-events-none overflow-visible" 
        viewBox="0 0 100 50"
      >
        <motion.path
          d="M 0 25 L 90 25"
          fill="transparent"
          stroke="#22d3ee"
          strokeWidth="3"
          initial={{ pathLength: 0, x: -50 }}
          animate={{ pathLength: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="drop-shadow-neon"
        />
        <motion.rect
          x="85" y="15" width="15" height="20"
          fill="#22d3ee"
          rx="1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.3 }}
        />
      </svg>

      <div className="relative drop-shadow-deep">
        <GlitchText text="PROPOJ.APP" className="gradient-text text-glow block" />
      </div>

      {/* Pravý kabel */}
      <svg 
        className="absolute -right-28 w-28 h-12 pointer-events-none overflow-visible" 
        viewBox="0 0 100 50"
      >
        <motion.path
          d="M 100 25 L 10 25"
          fill="transparent"
          stroke="#d946ef"
          strokeWidth="3"
          initial={{ pathLength: 0, x: 50 }}
          animate={{ pathLength: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="drop-shadow-purple"
        />
        <motion.rect
          x="0" y="15" width="15" height="20"
          fill="#d946ef"
          rx="1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.3 }}
        />
      </svg>
    </div>
  );
};

export default PropojLogo;
