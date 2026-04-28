import { useState, useEffect } from 'react';
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
  Terminal as TerminalIcon,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProjectManager from '@/components/admin/ProjectManager';
import Terminal from '@/components/admin/Terminal';
import HudToast from '@/components/admin/HudToast';
import type { ToastType } from '@/components/admin/HudToast';

const MonitoringView = () => {
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
      setError(err.message || 'Failed to connect to sidecar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
    const interval = setInterval(getStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <TerminalIcon className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-[0.4em] text-white">System Monitoring</h1>
            <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest mt-1">
              <span className="flex items-center gap-1"><Clock size={10} /> Last Scan: {lastUpdated.toLocaleTimeString()}</span>
              <span>//</span>
              <span className="text-purple-500/50">Core_v1.0</span>
            </div>
          </div>
        </div>

        <button 
          onClick={getStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Force Scan
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-400"
        >
          <ShieldAlert size={20} />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest">Error: {error}</p>
            <p className="text-[10px] opacity-70">Check sidecar connectivity and authorization.</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((container, idx) => (
          <motion.div
            key={container.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-slate-900/40 border border-white/5 hover:border-purple-500/30 p-6 rounded-2xl transition-all backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/[0.02] transition-all rounded-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg border border-white/10 group-hover:border-purple-500/30 transition-all">
                    <Layers className="text-white/40 group-hover:text-purple-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-all uppercase tracking-wider truncate max-w-[150px]">
                      {container.name}
                    </h3>
                    <p className="text-[10px] text-white/20 font-mono truncate max-w-[150px]">{container.image}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                  container.state === 'running' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${container.state === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter truncate max-w-[60px]">{container.status}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-white/30 flex items-center gap-1"><Cpu size={10} /> CPU Load</span>
                    <span className="text-cyan-400">{container.cpu_percent}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${container.cpu_percent}%` }}
                      className={`h-full transition-all duration-1000 ${
                        container.cpu_percent > 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-white/30 flex items-center gap-1"><Database size={10} /> Memory ({formatBytes(container.memory_usage)})</span>
                    <span className="text-purple-400">{container.memory_percent}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${container.memory_percent}%` }}
                      className="h-full bg-purple-500 transition-all duration-1000"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-500">
                <Activity size={12} />
                <span className="truncate">ID: {container.id.slice(0, 12)}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && stats.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCcw className="animate-spin text-purple-500" size={32} />
            <p className="text-xs text-white/30 uppercase tracking-[0.3em]">Establishing secure link...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'projects' | 'terminal'>('monitoring');
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
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
      </AnimatePresence>

      <HudToast toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
};

export default AdminPage;
