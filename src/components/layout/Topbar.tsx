import React from 'react';
import { Bell, Search, User, Zap } from 'lucide-react';

const Topbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-8 z-40">
      {/* Search area / Context info */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Search kernel..." 
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs font-mono text-white outline-none focus:border-cyber-purple/50 w-64 transition-all"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest px-3 py-1 border border-white/5 rounded-full bg-white/[0.02]">
          <Zap size={10} className="text-cyber-neon" />
          Latency: 12ms
        </div>
      </div>

      {/* User & Alerts */}
      <div className="flex items-center gap-6">
        <button 
          title="Notifications"
          aria-label="View notifications"
          className="relative p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyber-purple rounded-full border-2 border-slate-950" />
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-white uppercase tracking-tighter">Jakub_Kroca</span>
            <span className="text-[9px] font-mono text-cyber-neon/60">ROOT_ADMIN</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-blue p-[1px]">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <User size={16} className="text-white/60" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
