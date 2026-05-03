import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { databases, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { 
  ChevronRight, 
  ChevronDown,
  Search, 
  Sparkles,
  Loader2,
  Trash2,
  Zap,
  Clipboard,
  Home,
  Menu,
  ChevronLeft,
  Database
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
  content: string; // Sections as JSON string
  tags: string[];
}

const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [currentArticle, setCurrentArticle] = useState<KnowledgeArticle | null>(null);
  
  const [expandedCats, setExpandedCats] = useState(new Set(['Vše']));
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
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryGroups = useMemo(() => {
    const groups: Record<string, KnowledgeArticle[]> = { 'Vše': articles };
    articles.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });
    return groups;
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Vše' || a.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, activeCategory]);

  const askGemini = async (prompt: string, systemInstruction: string, isJson = false) => {
    if (!GEMINI_API_KEY) return null;
    try {
      const payload: any = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };
      if (isJson) payload.generationConfig = { responseMimeType: "application/json" };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) { return null; }
  };

  const generateNewArticle = async () => {
    if (!searchTerm) return;
    setAiLoading(true);
    try {
      const system = `Vytvoř detailní technický tahák v JSON. Jazyk: čeština. Struktura: { "title": string, "category": string, "sections": [{ "sectionTitle": string, "items": [{ "label": string, "cmd": string }] }] }.`;
      const jsonStr = await askGemini(`Vytvoř tahák pro: ${searchTerm}`, system, true);
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
        setSearchTerm('');
        setIsAiMode(false);
      }
    } catch (e) { console.error(e); } finally { setAiLoading(false); }
  };

  const toggleCat = (cat: string) => {
    const newSet = new Set(expandedCats);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setExpandedCats(newSet);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const explainCommand = async (cmd: string, id: string) => {
    setAiExplainingId(id);
    const explanation = await askGemini(`Vysvětli: ${cmd}`, "Stručně a česky vysvětli příkaz v 1 větě.");
    if (explanation) setAiExplanation({ id, text: explanation });
    setAiExplainingId(null);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Smazat záznam?')) return;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setArticles(prev => prev.filter(a => a.$id !== id));
      if (currentArticle?.$id === id) setCurrentArticle(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-40px)] bg-[#05050f] text-slate-300 flex overflow-hidden">
      
      {/* INTERNAL SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-16'} shrink-0 transition-all duration-300 bg-slate-950/50 border-r border-indigo-500/10 backdrop-blur-xl flex flex-col z-10`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-500/5">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-indigo-400">
            <Menu size={20} />
          </button>
          {isSidebarOpen && <Zap className="text-indigo-500" size={20} />}
        </div>

        <nav className={`flex-1 overflow-y-auto px-3 py-6 space-y-2 ${!isSidebarOpen && 'hidden'}`}>
          <p className="text-[10px] font-bold text-indigo-500/40 uppercase tracking-[0.2em] mb-4 ml-3">Navigace</p>
          
          {Object.entries(categoryGroups).map(([catName, catArticles]) => (
            <div key={catName} className="space-y-1">
              <button 
                onClick={() => { toggleCat(catName); setActiveCategory(catName); setCurrentArticle(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === catName ? 'bg-indigo-600/10 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span className="flex items-center gap-2">
                  {expandedCats.has(catName) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {catName}
                </span>
                <span className="text-[9px] opacity-40 font-mono">{catArticles.length}</span>
              </button>

              {expandedCats.has(catName) && catName !== 'Vše' && (
                <div className="ml-4 pl-2 border-l border-indigo-500/10 space-y-1 mt-1">
                  {catArticles.map(art => (
                    <button 
                      key={art.$id}
                      onClick={() => setCurrentArticle(art)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${currentArticle?.$id === art.$id ? 'bg-white/5 text-white font-semibold' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      <span className="truncate">{art.title}</span>
                      <ChevronRight size={12} className="opacity-20" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)]">
        
        {/* INTERNAL HEADER */}
        <header className="h-16 bg-slate-950/20 border-b border-indigo-500/10 backdrop-blur-md flex items-center px-6 gap-6 z-20">
          <div className="flex-1 hidden sm:flex items-center gap-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase font-mono">
            <button onClick={() => { setCurrentArticle(null); setActiveCategory('Vše'); }} className="hover:text-indigo-400"><Home size={16} /></button>
            <span className="opacity-30">/</span>
            <button onClick={() => setCurrentArticle(null)} className="hover:text-indigo-300">{activeCategory}</button>
            {currentArticle && (
              <>
                <span className="opacity-30">/</span>
                <span className="text-white truncate max-w-[200px]">{currentArticle.title}</span>
              </>
            )}
          </div>

          <div className="relative w-full max-w-lg flex items-center gap-2">
            <div className="flex bg-slate-900/60 p-1 rounded-xl border border-indigo-500/10">
              <button 
                onClick={() => setIsAiMode(false)} 
                className={`p-2 rounded-lg transition-colors ${!isAiMode ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Search size={16} />
              </button>
              <button 
                onClick={() => setIsAiMode(true)} 
                className={`p-2 rounded-lg transition-colors ${isAiMode ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Sparkles size={16} />
              </button>
            </div>
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={isAiMode ? "Generovat..." : "Hledat..."} 
                className={`w-full pl-4 pr-12 py-2 rounded-xl bg-slate-900/40 border text-sm text-white focus:outline-none transition-all ${isAiMode ? 'border-indigo-500/40 ring-4 ring-indigo-500/5' : 'border-indigo-500/10 focus:border-indigo-500/30'}`}
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && isAiMode && generateNewArticle()}
              />
              {isAiMode && searchTerm.length > 1 && (
                <button 
                  onClick={generateNewArticle} 
                  disabled={aiLoading} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-4 opacity-30"
              >
                <Loader2 className="animate-spin" size={32} />
                <span className="text-[10px] uppercase tracking-[0.4em] font-mono">Syncing_Braintrust</span>
              </motion.div>
            ) : !currentArticle ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto"
              >
                {filteredArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArticles.map(art => (
                      <div 
                        key={art.$id} 
                        onClick={() => setCurrentArticle(art)} 
                        className="group bg-slate-900/40 border border-indigo-500/10 p-5 rounded-2xl hover:border-indigo-400/40 transition-all cursor-pointer relative shadow-lg overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteArticle(art.$id!); }} 
                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-2">{art.category}</span>
                        <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors truncate">{art.title}</h3>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                          <span className="text-[10px] text-slate-500 uppercase tracking-tight">{JSON.parse(art.content).length} SECTIONS</span>
                          <ChevronRight size={16} className="text-indigo-500/20 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center opacity-30 uppercase text-xs font-mono tracking-[0.5em] flex flex-col items-center gap-4">
                    <Database size={32} className="opacity-20" />
                    ŽÁDNÁ DATA
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="article"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto"
              >
                <button 
                  onClick={() => setCurrentArticle(null)} 
                  className="mb-8 flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} /> Zpět
                </button>
                <header className="mb-12 flex justify-between items-end border-b border-indigo-500/10 pb-8">
                  <div>
                    <span className="text-xs font-black tracking-widest text-indigo-500 uppercase">{currentArticle.category}</span>
                    <h2 className="text-4xl font-black text-white mt-2 tracking-tight">{currentArticle.title}</h2>
                  </div>
                  <button onClick={() => deleteArticle(currentArticle.$id!)} className="p-3 bg-red-500/5 text-red-500/60 rounded-xl hover:bg-red-500/10 transition-colors"><Trash2 size={20} /></button>
                </header>
                <div className="space-y-16 pb-20">
                  {JSON.parse(currentArticle.content).map((section: ArticleSection, sIdx: number) => (
                    <section key={sIdx} className="space-y-6">
                      <h4 className="flex items-center gap-3 text-indigo-300 font-bold text-xs uppercase tracking-widest">
                        <div className="w-8 h-px bg-indigo-500/30" /> 
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
                                  className="text-[9px] text-indigo-400 flex items-center gap-1.5 opacity-40 hover:opacity-100 font-bold"
                                >
                                  {aiExplainingId === uid ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} INFO
                                </button>
                              </div>
                              <div className="relative group/code">
                                <div className="bg-[#0c0c1d] border border-indigo-500/10 p-5 rounded-2xl font-mono text-sm text-indigo-100/90 shadow-inner overflow-x-auto pr-14"><code>{item.cmd}</code></div>
                                <button onClick={() => copyToClipboard(item.cmd)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl opacity-0 group-hover/code:opacity-100 transition-all border border-indigo-500/10 shadow-xl"><Clipboard size={16} /></button>
                              </div>
                              {aiExplanation && aiExplanation.id === uid && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl text-[11px] leading-relaxed text-indigo-300/80 italic">
                                  <Zap size={12} className="inline mr-2 opacity-50" />{aiExplanation.text}
                                </motion.div>
                              )}
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
        </div>
      </main>

      {/* AI GLOBAL OVERLAY */}
      {aiLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="mt-8 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.5em] animate-pulse">Generuji Braintrust...</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
