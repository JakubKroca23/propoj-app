import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Terminal, ShieldCheck, Info } from 'lucide-react';
import { useContact } from '@/hooks/useContact';

interface ContactPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactPanel: React.FC<ContactPanelProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const { sendMessage, sending, success, error, resetStatus } = useContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await sendMessage(formData);
    if (ok) {
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000]"
          />

          {/* Side Panel - SLIDE FROM RIGHT */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-slate-950 border-l border-white/10 z-[10001] shadow-2xl flex flex-col"
          >
            {/* HUD Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyber-purple/10 rounded-lg">
                  <Mail className="w-5 h-5 text-cyber-purple" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-widest uppercase">Secure_Comms</h2>
                  <div className="text-[10px] font-mono text-cyber-purple/40 flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse" />
                    ENCRYPTION_LAYER :: V3_ACTIVE
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                title="Close Contact Form"
                aria-label="Close contact panel"
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="w-16 h-16 bg-cyber-neon/10 border border-cyber-neon/20 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-cyber-neon" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Zpráva doručena</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Vaše data byla zašifrována a uložena do centrální databáze PROPOJ.APP.</p>
                  <button 
                    onClick={resetStatus}
                    className="mt-4 text-[10px] font-mono text-cyber-neon uppercase tracking-widest border-b border-cyber-neon/20 pb-1"
                  >
                    Poslat další zprávu
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px] font-mono flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] ml-1">Identita / Jméno</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-sm outline-none focus:border-cyber-purple/50 transition-all"
                      placeholder="vložte jméno..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] ml-1">Návratový kanál / Email</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-sm outline-none focus:border-cyber-purple/50 transition-all"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] ml-1">Payload / Zpráva</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-sm outline-none focus:border-cyber-purple/50 transition-all resize-none"
                      placeholder="vaše zpráva..."
                    />
                  </div>

                  <motion.button
                    disabled={sending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-cyber-purple text-white font-black uppercase tracking-[0.3em] rounded-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {sending ? (
                      <Terminal className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Odeslat Paket
                  </motion.button>
                </form>
              )}
            </div>

            {/* HUD Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-center">
              <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">
                Secure_Transmission_End_to_End
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactPanel;
