import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// We use a simpler interface to avoid complex type conflicts with Framer Motion in strict environments
interface HudButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  subtext?: string;
  metadata?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const HudButton: React.FC<HudButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  subtext, 
  metadata, 
  onClick,
  disabled,
  type = "button"
}) => {
  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "relative group outline-none",
        className
      )}
    >
      {/* Hlavní tělo tlačítka s Clip-Path */}
      <div 
        className={cn(
          "relative px-10 py-4 transition-all duration-300 hud-clip",
          variant === 'primary' 
            ? "bg-cyber-violet/20 border-l-2 border-cyber-neon text-white hover:bg-cyber-violet/40" 
            : "bg-white/[0.02] border border-white/10 text-slate-400 hover:text-white hover:border-cyber-turquoise/50"
        )}
      >
        <div className="flex flex-col items-start gap-0.5">
          {metadata && (
            <span className={cn(
              "text-[8px] font-mono tracking-[0.2em] mb-1",
              variant === 'primary' ? "text-cyber-neon" : "text-slate-500"
            )}>
              [{metadata}]
            </span>
          )}
          <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-sm text-white">
            {children}
          </div>
          {subtext && (
            <span className="text-[9px] opacity-40 font-light lowercase italic">
              {subtext}
            </span>
          )}
        </div>

        {/* Scanning Line Effect (Primary only) */}
        {variant === 'primary' && (
          <motion.div 
            variants={{ hover: { top: ["0%", "100%", "0%"] } }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-cyber-neon/30 blur-sm pointer-events-none"
          />
        )}
      </div>

      {/* Dekorativní rohy vně tlačítka */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyber-neon opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyber-neon opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
};

export default HudButton;
