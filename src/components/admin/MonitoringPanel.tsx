import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDockerStats } from '@/api/sidecar';
import { 
  Activity, 
  Cpu, 
  Database, 
  Layers, 
  ShieldAlert, 
  RefreshCcw,
  Clock,
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-80 bg-slate-950/90 border-l border-white/10 backdrop-blur-2xl z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyber-purple/20 rounded-lg border border-cyber-purple/30">
                  <Activity className="text-cyber-neon" size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Live Monitoring</h2>
                  <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Sys_Status: Nominal</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="p-4 bg-white/[0.02] border-b border-white/5 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-white/20 uppercase">Last Sync</span>
                <p className="text-[10px] font-mono text-cyan-400">{lastUpdated.toLocaleTimeString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-white/20 uppercase">Active Units</span>
                <p className="text-[10px] font-mono text-purple-400">{stats.length} Nodes</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                  <ShieldAlert size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{error}</span>
                </div>
              )}

              {stats.map((container) => (
                <div 
                  key={container.id}
                  className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server size={14} className="text-white/20" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[120px]">
                        {container.name}
                      </h3>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${container.state === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8px] uppercase font-bold text-white/40">
                        <span>CPU</span>
                        <span className="text-cyan-400">{container.cpu_percent}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${container.cpu_percent}%` }}
                          className="h-full bg-cyan-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8px] uppercase font-bold text-white/40">
                        <span>RAM</span>
                        <span className="text-purple-400">{container.memory_percent}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${container.memory_percent}%` }}
                          className="h-full bg-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && stats.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-30">
                  <RefreshCcw className="animate-spin" size={20} />
                  <span className="text-[8px] uppercase tracking-[0.4em]">Linking...</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <button 
                onClick={getStats}
                disabled={loading}
                className="w-full py-2 bg-cyber-purple/20 hover:bg-cyber-purple/30 border border-cyber-purple/40 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                Refresh Streams
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MonitoringPanel;
