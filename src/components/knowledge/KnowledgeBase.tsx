import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { databases, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { 
  ChevronRight, 
  Search, 
  Book, 
  ArrowLeft,
  Sparkles,
  Loader2,
  Trash2,
  Zap,
  Clipboard,
  Home
} from 'lucide-react';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface ArticleItem {
  label: string;
  cmd: string;
}

interface ArticleSection {
  sectionTitle: string;
  items: ArticleItem[];
}

interface KnowledgeArticle {
  $id?: string;
  title: string;
  category: string;
  content: string; // Store sections as JSON string
  tags: string[];
}

const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<KnowledgeArticle | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ id: string; text: string } | null>(null);
  const [aiExplainingId, setAiExplainingId] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderDesc('$createdAt')
      ]);
      setArticles(response.documents as any);
    } catch (error) {
      console.error('Fetch Articles Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !currentCategory || a.category === currentCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, currentCategory]);

  const askGemini = async (prompt: string, systemInstruction: string, isJson = false) => {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API Key missing');
      return null;
    }
    try {
      const payload: any = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };
      if (isJson) payload.generationConfig = { responseMimeType: "application/json" };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      console.error('Gemini Error:', err);
      return null;
    }
  };

  const generateNewArticle = async () => {
    if (!searchQuery) return;
    setAiLoading(true);
    try {
      const system = `Vytvoř detailní technický tahák v JSON. Jazyk: čeština. Struktura: { "title": string, "category": string, "sections": [{ "sectionTitle": string, "items": [{ "label": string, "cmd": string }] }] }.`;
      const jsonStr = await askGemini(`Vytvoř tahák pro: ${searchQuery}`, system, true);
      
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        const newDoc = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
          title: parsed.title,
          category: parsed.category,
          content: JSON.stringify(parsed.sections),
          tags: [parsed.category.toLowerCase()]
        });
        
        setArticles(prev => [newDoc as any, ...prev]);
        setCurrentArticle(newDoc as any);
        setSearchQuery('');
        setIsAiMode(false);
      }
    } catch (e) {
      console.error('Generation Error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Opravdu smazat?')) return;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setArticles(prev => prev.filter(a => a.$id !== id));
      if (currentArticle?.$id === id) setCurrentArticle(null);
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const explainCommand = async (cmd: string, id: string) => {
    setAiExplainingId(id);
    const explanation = await askGemini(`Vysvětli: ${cmd}`, "Stručně a česky vysvětli tento příkaz v jedné větě.");
    if (explanation) {
      setAiExplanation({ id, text: explanation });
    }
    setAiExplainingId(null);
  };

  const getSections = (article: KnowledgeArticle): ArticleSection[] => {
    try {
      return JSON.parse(article.content);
    } catch {
      return [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[0.3em] text-white flex items-center gap-3">
            <Book className="text-purple-500" size={24} />
            Knowledge_Base
          </h1>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">AI-Powered intelligence repository</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setIsAiMode(false)} 
              className={`p-2 rounded-lg transition-colors ${!isAiMode ? 'bg-purple-500/20 text-purple-400' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <Search size={16} />
            </button>
            <button 
              onClick={() => setIsAiMode(true)} 
              className={`p-2 rounded-lg transition-colors ${isAiMode ? 'bg-purple-500/20 text-purple-400' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <Sparkles size={16} />
            </button>
          </div>
          
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder={isAiMode ? "GENERATE_NEW..." : "SEARCH_REPO..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isAiMode && generateNewArticle()}
              className={`w-full bg-slate-900/40 border rounded-xl py-2.5 pl-4 pr-10 text-sm font-mono text-white placeholder:text-white/10 focus:outline-none transition-all ${isAiMode ? 'border-purple-500/40 ring-4 ring-purple-500/5' : 'border-white/10 focus:border-purple-500/50'}`}
            />
            {isAiMode && searchQuery.length > 1 && (
              <button 
                onClick={generateNewArticle}
                disabled={aiLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
        <button onClick={() => { setCurrentCategory(null); setCurrentArticle(null); }} className="hover:text-white transition-colors flex items-center gap-1">
          <Home size={12} /> Root
        </button>
        {currentCategory && (
          <>
            <ChevronRight size={10} />
            <button onClick={() => setCurrentArticle(null)} className="hover:text-white transition-colors">{currentCategory}</button>
          </>
        )}
        {currentArticle && (
          <>
            <ChevronRight size={10} />
            <span className="text-purple-400 truncate max-w-[200px]">{currentArticle.title}</span>
          </>
        )}
      </nav>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-xs uppercase tracking-widest">Loading Repository...</span>
          </div>
        ) : !currentArticle ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredArticles.map((art) => (
              <div 
                key={art.$id}
                onClick={() => setCurrentArticle(art)}
                className="group relative bg-slate-900/40 border border-white/5 p-5 rounded-2xl hover:border-purple-500/30 transition-all cursor-pointer shadow-lg overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteArticle(art.$id!); }} 
                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-500 block mb-2">{art.category}</span>
                <h3 className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors truncate uppercase tracking-wider">{art.title}</h3>
                
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[9px] text-white/20 uppercase tracking-widest">
                    {getSections(art).length} Sections
                  </span>
                  <ChevronRight size={16} className="text-purple-500/20 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
            
            {filteredArticles.length === 0 && (
              <div className="col-span-full py-24 text-center opacity-20 uppercase text-xs font-mono tracking-[0.5em]">
                Empty_Repository
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="article"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-4xl mx-auto"
          >
            <button 
              onClick={() => setCurrentArticle(null)} 
              className="mb-8 flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back_to_Index
            </button>
            
            <header className="mb-12 flex justify-between items-end border-b border-white/10 pb-8">
              <div>
                <span className="text-xs font-black tracking-widest text-purple-500 uppercase">{currentArticle.category}</span>
                <h2 className="text-4xl font-black text-white mt-2 tracking-tight uppercase">{currentArticle.title}</h2>
              </div>
              <button 
                onClick={() => deleteArticle(currentArticle.$id!)} 
                className="p-3 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </header>

            <div className="space-y-16 pb-20">
              {getSections(currentArticle).map((section, sIdx) => (
                <section key={sIdx} className="space-y-6">
                  <h4 className="flex items-center gap-3 text-purple-300 font-bold text-xs uppercase tracking-widest">
                    <div className="w-8 h-px bg-purple-500/30" /> 
                    {section.sectionTitle}
                  </h4>
                  <div className="grid gap-6 pl-4">
                    {section.items.map((item, iIdx) => {
                      const uid = `${sIdx}-${iIdx}`;
                      return (
                        <div key={iIdx} className="space-y-3 group/item">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{item.label}</label>
                            <button 
                              onClick={() => explainCommand(item.cmd, uid)} 
                              className="text-[9px] text-purple-400 flex items-center gap-1.5 opacity-40 hover:opacity-100 font-bold transition-opacity"
                            >
                              {aiExplainingId === uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} INFO
                            </button>
                          </div>
                          <div className="relative group/code">
                            <div className="bg-[#0c0c1d] border border-white/5 p-5 rounded-2xl font-mono text-sm text-purple-100/90 shadow-inner overflow-x-auto pr-14 scrollbar-hide">
                              <code>{item.cmd}</code>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(item.cmd)} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-purple-500/10 text-purple-400 rounded-xl opacity-0 group-hover/code:opacity-100 transition-all border border-purple-500/10 shadow-xl backdrop-blur-sm"
                            >
                              <Clipboard size={16} />
                            </button>
                          </div>
                          <AnimatePresence>
                            {aiExplanation && aiExplanation.id === uid && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl text-[11px] leading-relaxed text-purple-300/80 italic overflow-hidden"
                              >
                                <Zap className="w-3 h-3 inline mr-2 opacity-50" />
                                {aiExplanation.text}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI GLOBAL OVERLAY */}
      {aiLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin relative z-10" />
          </div>
          <p className="mt-8 text-purple-400 font-bold text-[10px] uppercase tracking-[0.5em] animate-pulse">Assembling Knowledge...</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
