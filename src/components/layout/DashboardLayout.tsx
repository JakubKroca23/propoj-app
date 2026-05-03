import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import ProjectPanel from '@/components/ui/ProjectPanel';
import ContactPanel from '@/components/ui/ContactPanel';
import MonitoringPanel from '@/components/admin/MonitoringPanel';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMonitoringOpen, setIsMonitoringOpen] = useState(false);

  return (
    <div className="flex h-screen bg-cyber-deep text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        onOpenPortfolio={() => setIsProjectsOpen(true)} 
        onOpenContact={() => setIsContactOpen(true)} 
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden pt-10">
        {/* Top Header */}
        <Topbar 
          onToggleMonitoring={() => setIsMonitoringOpen(!isMonitoringOpen)} 
          onOpenKnowledge={() => onTabChange?.('knowledge')}
          activeTab={activeTab}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_-20%,rgba(76,29,149,0.15),transparent_80%)]">
          <div className={activeTab === 'knowledge' ? 'h-full' : 'p-8'}>
            {children}
          </div>
        </main>

        {/* Floating Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-purple/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyber-blue/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Global Modals/Panels */}
      <ProjectPanel isOpen={isProjectsOpen} onClose={() => setIsProjectsOpen(false)} />
      <ContactPanel isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <MonitoringPanel isOpen={isMonitoringOpen} onClose={() => setIsMonitoringOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
