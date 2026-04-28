import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, Terminal, Info } from 'lucide-react';
import HudCard from './HudCard';
import { useProjects } from '@/hooks/useProjects';

interface ProjectPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({ isOpen, onClose }) => {
  const { projects, loading, error } = useProjects();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000]"
          />

          {/* Side Panel - SLIDE FROM LEFT */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-2xl bg-slate-950 border-r border-white/10 z-[10001] shadow-2xl flex flex-col"
          >
            {/* HUD Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyber-neon/10 rounded-lg">
                  <LayoutGrid className="w-5 h-5 text-cyber-neon" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-widest uppercase">Project_Portfolio</h2>
                  <div className="text-[10px] font-mono text-cyber-neon/40 flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-pulse" />
                    SECURE_DATABASE_LINK :: ESTABLISHED
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                title="Close Portfolio"
                aria-label="Close project portfolio panel"
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-white/40">
                  <Terminal className="w-12 h-12 animate-pulse" />
                  <span className="font-mono text-xs tracking-widest uppercase">Initializing_Data_Stream...</span>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-red-400/60 font-mono text-xs">
                  <Info className="w-12 h-12" />
                  <span>DATA_LINK_ERROR: {error}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <HudCard key={project.$id} {...project} />
                  ))}
                </div>
              )}
            </div>

            {/* HUD Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Info className="w-3 h-3" /> v1.0.2</span>
                <span>ARM64_NODE_01</span>
              </div>
              <div className="px-3 py-1 bg-cyber-neon/5 border border-cyber-neon/20 rounded-full">
                <span className="text-[8px] font-mono text-cyber-neon tracking-[0.2em] uppercase animate-pulse">Live_Sync</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectPanel;
