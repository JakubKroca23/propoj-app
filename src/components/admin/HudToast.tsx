import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface HudToastProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const HudToast: React.FC<HudToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.9 }}
            className="pointer-events-auto"
          >
            <div className={`relative min-w-[300px] bg-slate-900/90 border-l-4 backdrop-blur-xl p-4 shadow-2xl overflow-hidden group ${
              toast.type === 'success' ? 'border-cyan-500 shadow-cyan-500/10' :
              toast.type === 'error' ? 'border-red-500 shadow-red-500/10' :
              toast.type === 'warning' ? 'border-yellow-500 shadow-yellow-500/10' :
              'border-purple-500 shadow-purple-500/10'
            }`}>
              {/* Animated Scanline for Toast */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
              
              <div className="flex items-start gap-4">
                <div className={`mt-1 ${
                  toast.type === 'success' ? 'text-cyan-400' :
                  toast.type === 'error' ? 'text-red-400' :
                  toast.type === 'warning' ? 'text-yellow-400' :
                  'text-purple-400'
                }`}>
                  {toast.type === 'success' && <ShieldCheck size={18} />}
                  {toast.type === 'error' && <AlertTriangle size={18} />}
                  {toast.type === 'warning' && <AlertTriangle size={18} />}
                  {toast.type === 'info' && <Terminal size={18} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      [SYS_LOG_{toast.type.toUpperCase()}]
                    </span>
                    <button 
                      onClick={() => removeToast(toast.id)}
                      className="text-white/20 hover:text-white transition-colors"
                      title="Dismiss Log"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-white/80 font-mono leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: "linear" }}
                onAnimationComplete={() => removeToast(toast.id)}
                className={`absolute bottom-0 left-0 h-[1px] ${
                  toast.type === 'success' ? 'bg-cyan-500' :
                  toast.type === 'error' ? 'bg-red-500' :
                  toast.type === 'warning' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default HudToast;
