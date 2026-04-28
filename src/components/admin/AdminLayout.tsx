import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  Activity, 
  Box, 
  ShieldCheck,
  LogOut, 
  Menu,
  X,
  Terminal as TerminalIcon,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'monitoring' | 'projects' | 'terminal';
  setActiveTab: (tab: 'monitoring' | 'projects' | 'terminal') => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'projects', label: 'Projects', icon: Box },
    { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono flex flex-col overflow-hidden relative">
      {/* Global Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Top Bar HUD */}
      <header className="h-16 border-b border-purple-500/10 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-cyan-400"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="text-purple-500 hover:text-cyan-400 transition-colors">
            <ShieldCheck size={24} />
          </Link>
          <div className="hidden md:block h-4 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] text-purple-500/50 uppercase tracking-[0.3em]">Administrator</span>
            <span className="text-[10px] md:text-xs font-bold text-white/80 tracking-widest uppercase truncate max-w-[100px] md:max-w-none">
              {user?.email?.split('@')[0] || 'ADMIN'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-cyan-500/50 uppercase tracking-widest">Network</span>
              <span className="text-[10px] text-cyan-400 uppercase flex items-center gap-1">
                <Zap size={10} className="animate-pulse" /> Linked
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="p-2 rounded-full border border-purple-500/20 hover:border-red-500/30 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all group"
            title="Terminate Session"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar HUD (Desktop) */}
        <aside className="hidden md:flex w-64 border-r border-purple-500/10 bg-slate-900/30 backdrop-blur-lg flex-col z-10">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative overflow-hidden ${
                    isActive 
                      ? 'bg-purple-500/10 text-cyan-400 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                      : 'text-white/40 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-cyan-400' : 'group-hover:text-purple-400'} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-purple-500/10 bg-black/20">
            <div className="flex items-center justify-between text-[8px] text-purple-500/40 uppercase tracking-widest mb-2">
              <span>Environment</span>
              <span className="text-cyan-500/40">v2.0.4-stable</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: [-100, 200] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-20 h-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30"
              />
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[25] md:hidden"
              />
              <motion.div 
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-purple-500/20 z-[30] md:hidden p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-8 px-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Navigation</span>
                  <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-white/40"
                title="Close Navigation"
              >
                <X size={20} />
              </button>
                </div>
                <div className="flex-1 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all ${
                          isActive ? 'bg-purple-500/20 text-cyan-400 border border-purple-500/30' : 'text-white/40'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs uppercase tracking-widest font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.05),transparent_50%)] p-4 md:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
