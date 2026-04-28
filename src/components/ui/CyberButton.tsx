import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CyberButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const CyberButton: React.FC<CyberButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  onClick,
  disabled,
  type = "button"
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "relative px-8 py-3 font-bold uppercase tracking-widest text-xs transition-all duration-300",
        "before:absolute before:inset-0 before:border before:transition-all",
        variant === 'primary' 
          ? "bg-cyber-violet text-white before:border-cyber-neon shadow-[0_0_15px_rgba(139,92,246,0.4)]"
          : "bg-transparent text-cyber-neon before:border-cyber-neon/40 hover:before:border-cyber-neon hover:bg-cyber-neon/10",
        "glitch-hover overflow-hidden",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* HUD Linky v tlačítku */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50" />
    </motion.button>
  );
};

export default CyberButton;
