import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  Book, 
  Folder, 
  FileText, 
  Terminal, 
  Server, 
  Globe, 
  Code,
  ArrowLeft
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  tags?: string[];
}

interface SubCategory {
  id: string;
  name: string;
  icon: any;
  articles: Article[];
}

interface Category {
  id: string;
  name: string;
  icon: any;
  subcategories: SubCategory[];
}

const KNOWLEDGE_DATA: Category[] = [
  {
    id: 'server',
    name: 'Infrastructure',
    icon: Server,
    subcategories: [
      {
        id: 'docker',
        name: 'Docker & Containers',
        icon: Terminal,
        articles: [
          { id: 'd-1', title: 'Basic Docker Commands', content: '```bash\ndocker ps # list running containers\ndocker-compose up -d # start services\n```', tags: ['docker', 'cli'] },
          { id: 'd-2', title: 'Container Resource Limits', content: 'Explain memory and cpu constraints in docker-compose.yml', tags: ['docker', 'config'] }
        ]
      },
      {
        id: 'nginx',
        name: 'Nginx Proxy',
        icon: Globe,
        articles: [
          { id: 'n-1', title: 'SSL Setup (Certbot)', content: 'How to setup Let\'s Encrypt with Nginx.', tags: ['security', 'web'] }
        ]
      }
    ]
  },
  {
    id: 'development',
    name: 'Development',
    icon: Code,
    subcategories: [
      {
        id: 'react',
        name: 'React Frontend',
        icon: Code,
        articles: [
          { id: 'r-1', title: 'Framer Motion Tips', content: 'Using AnimatePresence for layout transitions.', tags: ['ui', 'animation'] }
        ]
      }
    ]
  }
];

const KnowledgeBase: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory | null>(null);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const resetNav = () => {
    setCurrentCategory(null);
    setCurrentSubCategory(null);
    setCurrentArticle(null);
  };

  const goBack = () => {
    if (currentArticle) setCurrentArticle(null);
    else if (currentSubCategory) setCurrentSubCategory(null);
    else if (currentCategory) setCurrentCategory(null);
  };

  const totalItemsInCategory = (cat: Category) => {
    return cat.subcategories.reduce((acc, sub) => acc + sub.articles.length, 0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[0.3em] text-white flex items-center gap-3">
            <Book className="text-purple-500" size={24} />
            Knowledge_Base
          </h1>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">System intelligence and documentation repository</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH_REPOSITORY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all w-full md:w-64"
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
        <button onClick={resetNav} className="hover:text-white transition-colors">Root</button>
        {currentCategory && (
          <>
            <ChevronRight size={10} />
            <button onClick={() => { setCurrentSubCategory(null); setCurrentArticle(null); }} className="hover:text-white transition-colors">{currentCategory.name}</button>
          </>
        )}
        {currentSubCategory && (
          <>
            <ChevronRight size={10} />
            <button onClick={() => setCurrentArticle(null)} className="hover:text-white transition-colors">{currentSubCategory.name}</button>
          </>
        )}
        {currentArticle && (
          <>
            <ChevronRight size={10} />
            <span className="text-purple-400">{currentArticle.title}</span>
          </>
        )}
      </nav>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!currentCategory ? (
          /* Root: Category List */
          <motion.div 
            key="root"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {KNOWLEDGE_DATA.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setCurrentCategory(cat)}
                className="group relative p-6 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                    <cat.icon className="text-purple-400" size={24} />
                  </div>
                  <span className="text-[10px] font-mono text-white/20 uppercase bg-white/5 px-2 py-1 rounded">
                    {totalItemsInCategory(cat)} Units
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-wider">{cat.name}</h3>
                <p className="text-[10px] text-white/30 mt-2 line-clamp-2">Exploration of {cat.subcategories.length} core sub-systems and protocols.</p>
              </button>
            ))}
          </motion.div>
        ) : !currentSubCategory ? (
          /* Category: Subcategory List */
          <motion.div 
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {currentCategory.subcategories.map((sub) => (
              <button 
                key={sub.id}
                onClick={() => setCurrentSubCategory(sub)}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <sub.icon size={18} className="text-white/40" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{sub.name}</h4>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest">{sub.articles.length} Knowledge Blocks</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/20" />
              </button>
            ))}
          </motion.div>
        ) : !currentArticle ? (
          /* Subcategory: Article List */
          <motion.div 
            key="subcategory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {currentSubCategory.articles.map((art) => (
              <button 
                key={art.id}
                onClick={() => setCurrentArticle(art)}
                className="w-full flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-xl hover:border-purple-500/20 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <FileText size={16} className="text-purple-400/50" />
                  <span className="text-sm font-medium text-white/80 group-hover:text-white">{art.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {art.tags?.map(tag => (
                    <span key={tag} className="text-[8px] font-mono text-white/20 uppercase border border-white/5 px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                  <ChevronRight size={14} className="text-white/20" />
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          /* Article View */
          <motion.div 
            key="article"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">{currentArticle.title}</h2>
              <button 
                onClick={() => setCurrentArticle(null)}
                className="flex items-center gap-2 text-[10px] font-mono text-white/30 hover:text-white transition-colors uppercase"
              >
                <ArrowLeft size={12} /> Return_to_List
              </button>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {currentArticle.content}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap gap-2">
              {currentArticle.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] text-purple-400 uppercase tracking-widest">
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBase;
