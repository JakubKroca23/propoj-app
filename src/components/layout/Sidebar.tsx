import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutDashboard, Blocks, FolderKanban, Activity, Settings, Layers } from 'lucide-react';



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
    { id: 'monitoring', label: 'Monitoring', icon: Activity, metadata: 'MON-04' },
    { id: 'terminal', label: 'Terminal', icon: Layers, metadata: 'INT-05' },
  ];
  
  const systemItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 56 : 200 }}
      className={`h-screen bg-slate-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col relative z-[40] pt-0`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute ${isCollapsed ? '-right-2' : '-right-3'} top-1/2 -translate-y-1/2 bg-slate-900 border border-white/10 rounded-full p-1 text-white hover:bg-slate-800 transition-colors shadow-lg shadow-black/50`}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Spacer for Topbar */}
      <div className="h-10" />


      {/* Main Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-2 mt-2`}>
        <div className="mb-4">
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} rounded-lg transition-all group ${
                activeTab === item.id 
                  ? 'bg-cyber-purple/20 text-white border border-cyber-purple/30 shadow-[0_0_15px_rgba(76,29,149,0.3)]' 
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <item.icon size={isCollapsed ? 18 : 20} className={activeTab === item.id ? 'text-cyber-neon' : 'group-hover:text-cyber-neon'} />
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-[8px] font-mono text-white/20 uppercase">{item.metadata}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5">
          
          {systemItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} rounded-lg transition-all group ${
                activeTab === item.id 
                  ? 'bg-cyber-purple/20 text-white border border-cyber-purple/30 shadow-[0_0_15px_rgba(76,29,149,0.3)]' 
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <item.icon size={isCollapsed ? 18 : 20} className={activeTab === item.id ? 'text-cyber-purple' : 'group-hover:text-cyber-purple'} />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}

        </div>
      </nav>

      {/* Status Footer removed to avoid duplication with Topbar logo */}
    </motion.aside>
  );
};

export default Sidebar;
