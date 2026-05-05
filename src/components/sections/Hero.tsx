import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PropojLogo from '@/components/ui/PropojLogo';
import { Power } from 'lucide-react';

interface HeroProps {
  onEnter?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = currentTime.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter?.();
      navigate('/builder');
    }, 1500);
  };

  return (
    <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden bg-transparent">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-slate-950/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.8),transparent_100%)] pointer-events-none" />
      
      {/* Vortex Streaks */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{ WebkitMaskImage: 'radial-gradient(circle, transparent 30%, black 60%)', maskImage: 'radial-gradient(circle, transparent 30%, black 60%)' }}
      >
        {useMemo(() => {
          const slowdown = 3.3333333; // ~70% slower -> durations ~3.33x
          return [...Array(14)].map((_, i) => {
            // Slow durations so lines feel like flying through space
            const baseDuration = 6 + Math.random() * 4; // 6-10s base
            const duration = baseDuration * 1.2; // slight variation
            const delay = Math.random() * -duration;
            const angle = Math.random() * Math.PI * 2;

            // shorter streaks: 30-70 vw
            const length = 30 + Math.random() * 40; // 30-70 vw

            return (
              <motion.div
                key={`streak-${i}`}
                initial={{ width: '0vw', opacity: 0 }}
                animate={{ 
                  width: `${length}vw`,
                  opacity: [0, 0.85, 0]
                }}
                transition={{ duration: duration * slowdown, repeat: Infinity, delay, ease: 'easeOut' }}
                className="absolute h-[1.2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                style={{ 
                  left: '50%',
                  top: '50%',
                  transform: `translateY(-50%) rotate(${angle}rad)`,
                  transformOrigin: 'left center'
                } as React.CSSProperties}
              />
            );
          });
        }, [])}
      </div>

      {/* ROTATING RINGS & SECTORS - VÍCE VRSTEV PODLE MOCKUPU */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Pozadí s jemnou mřížkou/tečkami */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
        
        {(() => {
          const sizes = [350, 384, 416, 464, 520];
          const maxIndex = sizes.length - 1;
          return sizes.map((size, i) => {
            const rotateDir = i % 2 === 0 ? 360 : -360;
            const rotateDuration = (25 + i * 10) * 3.3333333;
            const assembleDelay = (maxIndex - i) * 0.25; // outer -> inner
            const exitDelay = i * 0.22; // inner -> outer on exit

            const scaleAnim = isExiting ? 0.2 : 1;
            const opacityAnim = isExiting ? 0 : 1;
            const delayForAnim = isExiting ? exitDelay : assembleDelay;

            return (
              <motion.div 
                key={size}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: scaleAnim, opacity: opacityAnim, rotate: rotateDir }}
                transition={{
                  scale: { delay: delayForAnim, duration: 0.9, ease: 'easeOut' },
                  opacity: { delay: delayForAnim, duration: 0.9, ease: 'easeOut' },
                  rotate: { duration: rotateDuration, repeat: Infinity, ease: 'linear' }
                }}
                className="absolute border border-white/[0.05] rounded-full shadow-[0_0_20px_rgba(34,211,238,0.02)] z-10"
                style={{ 
                  width: size, 
                  height: size,
                  borderStyle: i % 2 === 1 ? 'dashed' : 'solid'
                }}
              >
                {i === maxIndex && [...Array(8)].map((_, j) => (
                  <div 
                    key={j}
                    className="absolute w-2 h-[1px] bg-white/20 [top:50%] [left:-4px] [transform-origin:var(--to)] [transform:rotate(var(--rot))]"
                    style={{ '--to': `${size/2 + 4}px 50%`, '--rot': `${j * 45}deg` } as any}
                  />
                ))}
              </motion.div>
            );
          });
        })()}

        {/* Rotující výseče (Arcs) - sytější barvy a více vrstev */}
        {(() => {
          const arcs = [370, 400, 432, 480, 512, 550];
          const maxIndexA = arcs.length - 1;
          return arcs.map((size, i) => {
            const rotateDir = i % 2 === 0 ? -360 : 360;
            const rotateDuration = (12 + i * 5) * 3.3333333;
            const assembleDelay = (maxIndexA - i) * 0.22;
            const exitDelay = i * 0.18;

            const scaleAnim = isExiting ? 0.2 : 1;
            const opacityAnim = isExiting ? 0 : 1;
            const delayForAnim = isExiting ? exitDelay : assembleDelay;

            return (
              <motion.div
                key={`arc-${size}`}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: scaleAnim, opacity: opacityAnim, rotate: rotateDir }}
                transition={{
                  scale: { delay: delayForAnim, duration: 0.9, ease: 'easeOut' },
                  opacity: { delay: delayForAnim, duration: 0.9, ease: 'easeOut' },
                  rotate: { duration: rotateDuration, repeat: Infinity, ease: 'linear' }
                }}
                className="absolute rounded-full border-2 border-transparent z-20"
                style={{ 
                  width: size, 
                  height: size,
                  borderTopColor: i % 3 === 0 ? 'rgba(34, 211, 238, 0.6)' : 'transparent',
                  borderRightColor: i % 3 === 1 ? 'rgba(192, 132, 252, 0.5)' : 'transparent',
                  borderLeftColor: i % 3 === 2 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderStyle: i % 2 === 1 ? 'dashed' : 'solid',
                  filter: `drop-shadow(0 0 12px ${i % 3 === 0 ? 'rgba(34, 211, 238, 0.3)' : 'rgba(192, 132, 252, 0.3)'})`
                }}
              />
            );
          });
        })()}
      </div>

      <div className="relative z-30 flex items-center justify-center min-h-screen w-full">
        {/* Nadpis se září */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={isExiting ? { opacity: 0, scale: 0.8, filter: 'blur(30px)' } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-3xl md:text-5xl font-black tracking-tighter drop-shadow-[0_0_25px_rgba(139,92,246,0.3)]"
        >
          <PropojLogo />
        </motion.h1>

        {/* Hodiny - doladěny podle obrázku, reagují na odchod */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isExiting ? { opacity: 0, scale: 0.8, filter: 'blur(20px)' } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute mb-52 flex flex-col items-center"
        >
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Jemnější ciferník */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full shadow-[0_0_5px_white/10] [transform:rotate(var(--rot))_translateY(var(--ty))]"
                style={{ '--rot': `${i * 30}deg`, '--ty': '-52px' } as any}
              />
            ))}
            <motion.div 
              className="absolute w-1 h-9 bg-cyan-400 rounded-full origin-bottom shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              style={{ rotate: (currentTime.getHours() % 12) * 30 + currentTime.getMinutes() * 0.5, bottom: '50%' }}
            />
            <motion.div 
              className="absolute w-0.5 h-12 bg-purple-400 rounded-full origin-bottom shadow-[0_0_15px_rgba(192,132,252,0.5)]"
              style={{ rotate: currentTime.getMinutes() * 6 + currentTime.getSeconds() * 0.1, bottom: '50%' }}
            />
          </div>
          
          <div className="mt-4">
            <span className="text-[10px] font-mono text-white/50 tracking-[0.6em] uppercase font-bold drop-shadow-sm">{dateString}</span>
          </div>
        </motion.div>

        {/* BOOT BUTTON - STYLOVĚJŠÍ S LEPŠÍ ANIMACÍ */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isExiting ? { opacity: 0, scale: 1.5, filter: 'blur(20px)' } : { opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="absolute mt-52 group cursor-pointer"
          onClick={handleEnter}
        >
          {/* Pulzující vnější kruhy */}
          <div className="absolute inset-[-15px] border border-cyan-500/10 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-[-10px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite] opacity-40" />
          
          <div className="relative w-24 h-24 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-2xl flex items-center justify-center transition-all duration-500 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/5 overflow-hidden">
            {/* Skenovací efekt v tlačítku */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]" />
            
            <div className="flex flex-col items-center z-10">
              <Power className="w-7 h-7 text-cyan-400 mb-1 transition-transform duration-500 group-hover:scale-110" />
              <span className="text-[8px] font-mono text-white/40 tracking-[0.3em] font-bold group-hover:text-white transition-colors uppercase">Initialize</span>
            </div>

            {/* Okrasné linky na obvodu */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                strokeDasharray="10 20" 
                className="text-white/10 group-hover:text-cyan-500/30 transition-colors"
              />
            </svg>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
