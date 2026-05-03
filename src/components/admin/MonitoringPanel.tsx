import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDockerStats } from '@/api/sidecar';
import { 
  Activity, 
  ShieldAlert, 
  RefreshCcw,
  X,
  Server
} from 'lucide-react';

interface MonitoringPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const getStats = async () => {
    try {
      setLoading(true);
      const data = await fetchDockerStats();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Link Failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getStats();
      const interval = setInterval(getStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-screen w-96 bg-slate-950/95 border-l border-white/10 backdrop-blur-2xl z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <Activity className="text-cyan-400" size={14} />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">System_Nodes</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/20 uppercase">{lastUpdated.toLocaleTimeString()}</span>
                <button 
                  onClick={onClose}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center text-[8px] font-mono text-white/30 uppercase tracking-widest">
              <div className="w-4">ST</div>
              <div className="flex-1">Container_Name</div>
              <div className="w-16 text-right">CPU</div>
              <div className="w-16 text-right">RAM</div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="m-4 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400">
                  <ShieldAlert size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{error}</span>
                </div>
              )}

              <div className="divide-y divide-white/5">
                {stats.map((container) => (
                  <div 
                    key={container.id}
                    className="px-4 py-2 flex items-center hover:bg-white/5 transition-colors group"
                  >
                    {/* Status Dot */}
                    <div className="w-4">
                      <div className={`w-1.5 h-1.5 rounded-full ${container.state === 'running' ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-red-500'}`} />
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-[10px] font-bold text-white/70 group-hover:text-white truncate uppercase tracking-wider">
                        {container.name}
                      </div>
                    </div>

                    {/* CPU */}
                    <div className="w-16 flex flex-col items-end gap-1">
                      <span className="text-[9px] font-mono text-cyan-400">{container.cpu_percent}%</span>
                      <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${container.cpu_percent}%` }}
                          className={`h-full ${container.cpu_percent > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                        />
                      </div>
                    </div>

                    {/* RAM */}
                    <div className="w-16 flex flex-col items-end gap-1 ml-4">
                      <span className="text-[9px] font-mono text-purple-400">{container.memory_percent}%</span>
                      <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${container.memory_percent}%` }}
                          className="h-full bg-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {loading && stats.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-2 opacity-20">
                  <RefreshCcw className="animate-spin" size={16} />
                  <span className="text-[8px] uppercase tracking-[0.4em]">Establishing Link</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <button 
                onClick={getStats}
                disabled={loading}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={10} className={loading ? 'animate-spin' : ''} />
                Force_Rescan
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MonitoringPanel;
