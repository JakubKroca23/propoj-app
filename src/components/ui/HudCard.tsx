import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code, Tag } from 'lucide-react';

interface HudCardProps {
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  demo_url?: string;
  github_url?: string;
}

const HudCard: React.FC<HudCardProps> = ({ 
  title, 
  description, 
  thumbnail, 
  tags, 
  demo_url, 
  github_url 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      {/* HUD Frame / Border */}
      <div className="absolute inset-0 bg-cyber-purple/5 border border-white/10 group-hover:border-cyber-neon/40 transition-colors duration-500 rounded-lg overflow-hidden">
        {/* Scanning effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-b from-transparent via-cyber-neon to-transparent h-1/2 w-full animate-scan" />
      </div>

      {/* Content */}
      <div className="relative p-4 flex flex-col gap-4">
        {/* Thumbnail with scifi cut */}
        <div className="relative aspect-video overflow-hidden rounded-md border border-white/5 bg-black/40">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyber-neon transition-colors">
              {title}
            </h3>
            <div className="flex gap-2">
              {github_url && (
                <a 
                  href={github_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="View Source on GitHub"
                  aria-label={`View ${title} source code on GitHub`}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <Code className="w-4 h-4" />
                </a>
              )}
              {demo_url && (
                <a 
                  href={demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="View Live Demo"
                  aria-label={`View live demo of ${title}`}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-400 line-clamp-2 font-normal leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyber-turquoise uppercase tracking-wider">
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-neon/30 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-neon/30 rounded-br-lg" />
    </motion.div>
  );
};

export default HudCard;
