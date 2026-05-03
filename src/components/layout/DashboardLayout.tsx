import React, { useState } from 'react';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange }) => {
  // Left panel removed: landing page only

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      <div className="flex-1 flex flex-col relative overflow-hidden pt-10">
        {/* Top Header */}
        <Topbar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.1),transparent_80%)]">
          <div className={activeTab === 'knowledge' ? 'h-full' : 'p-8'}>
            {children}
          </div>
        </main>

        {/* Floating Background Effects */}
        {/* Floating Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

export default DashboardLayout;
