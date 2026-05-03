import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutDashboard, Blocks, FolderKanban, Settings, Menu } from 'lucide-react';

interface SidebarProps {
  onOpenPortfolio?: () => void;
  onOpenContact?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'workspaces', onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'workspaces', label: 'Workspaces', icon: LayoutDashboard, metadata: 'SYS-01' },
    { id: 'widgets', label: 'Widget Library', icon: Blocks, metadata: 'UI-02' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, metadata: 'PRJ-03' },
  ];
  
  const systemItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sidebarTransition = { type: 'spring', stiffness: 300, damping: 30 } as const;

  return (
    <div className="relative z-[40]">
      {/* Toggle Button - Persistent */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-12 z-50 bg-slate-900 border border-white/10 rounded-full p-2 text-white hover:bg-slate-800 transition-all shadow-lg shadow-black/50 ${isCollapsed ? 'left-4' : 'left-[224px]'}`}
      >
        {isCollapsed ? <Menu size={16} className="text-cyber-turquoise" /> : <ChevronLeft size={16} />}
      </button>

      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 0 : 240,
          opacity: isCollapsed ? 0 : 1,
          x: isCollapsed ? -20 : 0
        }}
        transition={sidebarTransition}
        className="h-screen bg-slate-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col pt-0 overflow-hidden"
      >
        {/* Spacer for Topbar */}
        <div className="h-16" />

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-2 mt-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative ${
                  activeTab === item.id 
                    ? 'bg-cyber-purple/20 text-white border border-cyber-purple/30 shadow-[0_0_15px_rgba(76,29,149,0.2)]' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <item.icon 
                    size={20} 
                    className={`transition-colors duration-300 ${activeTab === item.id ? 'text-cyber-turquoise' : 'group-hover:text-cyber-turquoise'}`} 
                  />
                </div>

                <div className="overflow-hidden whitespace-nowrap flex flex-col items-start ml-3">
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">{item.metadata}</span>
                </div>

                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute left-0 w-1 h-6 bg-cyber-turquoise rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
            {systemItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative ${
                  activeTab === item.id 
                    ? 'bg-cyber-purple/20 text-white border border-cyber-purple/30 shadow-[0_0_15px_rgba(76,29,149,0.2)]' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <item.icon 
                    size={20} 
                    className={`transition-colors duration-300 ${activeTab === item.id ? 'text-cyber-purple' : 'group-hover:text-cyber-purple'}`} 
                  />
                </div>
                
                <div className="overflow-hidden whitespace-nowrap ml-3">
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </nav>
      </motion.aside>
    </div>
  );
};

export default Sidebar;
