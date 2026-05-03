import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('workspaces');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'workspaces' && (
          <motion.div
            key="workspaces"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground/50">Welcome to PROPOJ.APP Workspace</h2>
              <p className="text-sm text-muted-foreground/30 max-w-md">Select a module from the sidebar to begin interacting with the environment.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Dashboard;
