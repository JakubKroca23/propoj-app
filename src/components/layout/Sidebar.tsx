import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutDashboard, Blocks, FolderKanban, Activity, Settings, Layers } from 'lucide-react';



interface SidebarProps {
  onOpenPortfolio: () => void;
  onOpenContact: () => void;
}

const Sidebar: React.FC<SidebarProps> = (_props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { label: 'Workspaces', icon: LayoutDashboard, metadata: 'SYS-01', action: () => {} },
    { label: 'Widget Library', icon: Blocks, metadata: 'UI-02', action: () => {} },
    { label: 'Projects', icon: FolderKanban, metadata: 'PRJ-03', action: () => {} },
    { label: 'Monitoring', icon: Activity, metadata: 'MON-04', action: () => {} },
    { label: 'Integrations', icon: Layers, metadata: 'INT-05', action: () => {} },
  ];
  
  const systemItems = [
    { label: 'Settings', icon: Settings, action: () => {} },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 200 }}
      className={`h-screen bg-slate-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col relative z-[40] pt-0`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute ${isCollapsed ? '-right-2' : '-right-3'} top-16 bg-cyber-purple border border-white/10 rounded-full p-1 text-white hover:bg-cyber-violet transition-colors shadow-lg shadow-cyber-purple/20`}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo removed from Sidebar (moved to Topbar) */}
      <div className="h-16" />


      {/* Main Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-2 mt-4`}>
        <div className="mb-4">
          
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center ${isCollapsed ? 'gap-2 p-2' : 'gap-3 p-3'} rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all group`}
            >
              <item.icon size={isCollapsed ? 18 : 20} className="group-hover:text-cyber-neon" />
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
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center ${isCollapsed ? 'gap-2 p-2' : 'gap-3 p-3'} rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all group`}
            >
              <item.icon size={isCollapsed ? 18 : 20} className="group-hover:text-cyber-purple" />
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
