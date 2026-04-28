import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Activity, Shield, Cpu, Terminal } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <header>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">System_Overview</h1>
          <p className="text-slate-400 font-mono text-xs mt-1">Status: All systems operational. ARM64 Node 01 active.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'CPU Usage', value: '14.2%', icon: Cpu, color: 'text-cyber-neon' },
            { label: 'Memory', value: '2.4 / 8 GB', icon: Activity, color: 'text-cyber-purple' },
            { label: 'Threat Level', value: '0.00%', icon: Shield, color: 'text-cyber-blue' },
            { label: 'Active Tasks', value: '12', icon: Terminal, color: 'text-white' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`${stat.color} w-5 h-5`} />
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Realtime</span>
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-tighter mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-8 min-h-[400px] flex items-center justify-center text-center">
            <div className="max-w-xs">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="text-white/20 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vítejte v PROPOJ_OS</h3>
              <p className="text-slate-400 text-sm">Zde budou v budoucnu zobrazeny grafy vytížení vašich Docker kontejnerů a správa projektů.</p>
            </div>
          </div>
          
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Recent_Logs</h3>
             <div className="space-y-4 font-mono text-[10px]">
                {[
                    { time: '12:45:01', msg: 'System node ARM64 authorized' },
                    { time: '12:44:23', msg: 'Database link established' },
                    { time: '12:40:12', msg: 'Kernel secure update complete' },
                    { time: '12:38:55', msg: 'Admin login detected: Jakub_K' },
                ].map((log, i) => (
                    <div key={i} className="flex gap-3 text-white/40">
                        <span className="text-cyber-neon/60 whitespace-nowrap">[{log.time}]</span>
                        <span className="truncate">{log.msg}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
