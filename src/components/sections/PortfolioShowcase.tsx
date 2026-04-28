import React from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import { Power, ExternalLink, Tag } from 'lucide-react';

interface PortfolioShowcaseProps {
  onBack: () => void;
}

const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({ onBack }) => {
  const { projects, loading } = useProjects();
  
  // Only show featured projects as per user request
  const featuredProjects = projects.filter(p => p.featured);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-[1px] bg-cyan-500/50" />
          <h2 className="text-2xl font-bold uppercase tracking-[0.4em] text-white">
            Accessing_Portfolio
          </h2>
        </div>
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 px-4 py-2 border border-white/10 hover:border-cyan-500/30 transition-all bg-white/5 rounded-lg"
        >
          <Power size={14} className="text-cyan-400 group-hover:animate-pulse" />
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-white">Disconnect</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-500 animate-pulse font-mono text-xs uppercase tracking-widest">
            Fetching Data Streams...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project, idx) => (
            <motion.div
              key={project.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-slate-900/40 border border-white/10 p-4 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all backdrop-blur-md"
            >
              {/* Card Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-cyan-500/50" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-cyan-500/50" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-cyan-500/50" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-cyan-500/50" />

              <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 mb-4 relative">
                <img 
                  src={project.thumbnail} 
                  alt={project.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-tighter">Unit_ID: {project.$id.slice(0, 8)}</span>
                    <span className="text-[10px] font-mono text-white/20">#{project.order}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wider">{project.title}</h3>
                </div>

                <p className="text-xs text-white/40 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-1">
                      <Tag size={8} />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  {project.demo_url ? (
                    <a 
                      href={project.demo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-cyan-500 hover:text-cyan-300 transition-colors flex items-center gap-2 uppercase tracking-widest"
                    >
                      Initialize Link <ExternalLink size={12} />
                    </a>
                  ) : <div />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioShowcase;
