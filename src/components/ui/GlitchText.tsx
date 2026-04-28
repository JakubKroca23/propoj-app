import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className }) => {
  const [displayValue, setDisplayValue] = useState(text);
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@!%^&*()_+';

  useEffect(() => {
    let iteration = 0;
    let interval: any;

    const runGlitch = () => {
      interval = setInterval(() => {
        setDisplayValue(prev => 
          prev.split('')
            .map((_, index) => {
              if(index < iteration) return text[index];
              return characters[Math.floor(Math.random() * 26)];
            })
            .join('')
        );

        if(iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);
    };

    runGlitch();
    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayValue}
    </motion.span>
  );
};

export default GlitchText;
