import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropojLogo from '@/components/ui/PropojLogo';
import { 
  LayoutGrid, 
  Mail, 
  Terminal, 
  Cpu, 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  Settings,
  Shield,
  Home
} from 'lucide-react';



interface SidebarProps {
  onOpenPortfolio: () => void;
  onOpenContact: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenPortfolio, onOpenContact }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Terminal, label: 'Audit', metadata: 'CMD_EXEC', action: () => console.log('Audit') },
    { icon: LayoutGrid, label: 'Portfolio', metadata: 'DATA_GRID', action: onOpenPortfolio },
    { icon: Mail, label: 'Kontakt', metadata: 'SEC_COMMS', action: onOpenContact },
    { icon: Cpu, label: 'Detaily', metadata: 'SYS_SPEC', action: () => console.log('Details') },
  ];

  const systemItems = [
    { icon: Home, label: 'Intro', action: () => window.location.href = '/' },
    { icon: Monitor, label: 'Monitoring', path: '/monitoring' },
    { icon: Shield, label: 'Security', path: '/security' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-slate-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col relative z-[50]"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-cyber-purple border border-white/10 rounded-full p-1 text-white hover:bg-cyber-violet transition-colors shadow-lg shadow-cyber-purple/20"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo Area */}
      <div className="p-6 mb-4 flex items-center gap-3 overflow-hidden">
        <div className={`transition-all duration-300 ${isCollapsed ? 'scale-50 -ml-2' : 'scale-75 -ml-8'}`}>
           <PropojLogo />
        </div>
      </div>


      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="mb-4">
          {!isCollapsed && <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2 ml-2">Vessels</p>}
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
            >
              <item.icon size={20} className="group-hover:text-cyber-neon" />
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
          {!isCollapsed && <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2 ml-2">System</p>}
          {systemItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
            >
              <item.icon size={20} className="group-hover:text-cyber-purple" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}

        </div>
      </nav>

      {/* Status Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyber-neon/40">
            <div className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-pulse" />
            NODE_STABLE :: ARM64
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
