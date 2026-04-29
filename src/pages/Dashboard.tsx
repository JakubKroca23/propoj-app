import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MonitoringView from '@/components/admin/MonitoringView';
import ProjectManager from '@/components/admin/ProjectManager';
import Terminal from '@/components/admin/Terminal';
import HudToast from '@/components/admin/HudToast';
import type { ToastType } from '@/components/admin/HudToast';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('workspaces');
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'monitoring' && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MonitoringView />
          </motion.div>
        )}
        {activeTab === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectManager onToast={addToast} />
          </motion.div>
        )}
        {activeTab === 'terminal' && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Terminal />
          </motion.div>
        )}
        {activeTab === 'workspaces' && (
          <motion.div
            key="workspaces"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-white/50">Welcome to PROPOJ.APP Workspace</h2>
              <p className="text-sm text-white/30 max-w-md">Select a module from the sidebar to begin interacting with the environment.</p>
            </div>
          </motion.div>
        )}
        {activeTab === 'widgets' && (
          <motion.div
            key="widgets"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-white/50">Widget Library</h2>
              <p className="text-sm text-white/30 max-w-md">Widget component library and configuration interface will be initialized here.</p>
            </div>
          </motion.div>
        )}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-white/50">System Settings</h2>
              <p className="text-sm text-white/30 max-w-md">Global configuration for PROPOJ.APP system and modules.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <HudToast toasts={toasts} removeToast={removeToast} />
    </DashboardLayout>
  );
};

export default Dashboard;