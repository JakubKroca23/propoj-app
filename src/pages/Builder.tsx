import React, { useState, useCallback, useMemo, useEffect } from "react";
import { 
  Settings, Type, Pointer, Image as ImageIcon, 
  Layout, Server, X, ArrowUp, ArrowDown, Trash2, Save, Sparkles, Copy, Columns, Maximize2, Palette, Volume2, Loader2, Play, Minimize2, PanelLeftClose, PanelLeftOpen, Wand2, MessageSquare, CheckCircle2, ChevronRight, Monitor, Smartphone, Tablet, Download, Eye, Code, History, Undo2, Redo2, Layers
} from "lucide-react";

// =========================
// TYPES & INTERFACES
// =========================
type WidgetType = 'section' | 'columns' | 'aiGenerator' | 'aiImage' | 'aiPalette' | 'aiVoice' | 'heading' | 'text' | 'button' | 'card' | 'spacer' | 'image' | 'list';

interface WidgetLayout {
  colSpan: number;
  marginTop?: string;
  marginBottom?: string;
}

interface WidgetConfig {
  [key: string]: any;
}

interface WidgetNode {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
  layout: WidgetLayout;
  children?: WidgetNode[];
}

interface WidgetDefinition {
  name: string;
  category: string;
  icon: React.ReactNode;
  defaultConfig: WidgetConfig;
  isContainer?: boolean;
  render: (config: WidgetConfig, data: any, children?: React.ReactNode) => React.ReactNode;
  editor: (config: WidgetConfig, update: (updates: Partial<WidgetConfig>) => void) => React.ReactNode;
}

type WidgetRegistry = Record<WidgetType, WidgetDefinition>;

// =========================
// GEMINI API & RETRY LOGIC
// =========================
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || ""; 

async function fetchWithRetry(url: string, payload: any): Promise<any> {
  const delays = [1000, 2000, 4000];
  for (let i = 0; i < delays.length; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (i === delays.length - 1) throw new Error("Max retries reached");
        continue;
      }
      return await res.json();
    } catch (err) {
      if (i === delays.length - 1) throw err;
      await new Promise(r => setTimeout(r, delays[i]));
    }
  }
}

// 1. Text Generation
async function callGeminiText(prompt: string): Promise<string> {
  if (!apiKey) return "API klíč není nastaven. Nastavte VITE_GEMINI_API_KEY v .env.";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const data = await fetchWithRetry(url, payload);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Žádný text nebyl vygenerován.";
  } catch (e: any) {
    return "Chyba při generování textu: " + e.message;
  }
}

// 2. Structured JSON Generation
async function callGeminiJSON(prompt: string, schemaProperties: any): Promise<any> {
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: { type: "OBJECT", properties: schemaProperties }
    }
  };
  try {
    const data = await fetchWithRetry(url, payload);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("JSON Generation error", e);
    return null;
  }
}

// 3. Image Generation (Imagen 3)
async function callImagen(prompt: string): Promise<string | null> {
  if (!apiKey) return null;
  // Poznámka: Imagen obvykle vyžaduje Vertex AI nebo specifické endpointy v Gemini API
  // Pro účely dema použijeme placeholder nebo simulaci, pokud není Imagen přímo dostupný přes tento endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate:predict?key=${apiKey}`;
  const payload = { instances: [{ prompt }], parameters: { sampleCount: 1 } };
  try {
    const data = await fetchWithRetry(url, payload);
    const base64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (base64) return `data:image/png;base64,${base64}`;
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"; // Fallback
  } catch (e) {
    console.error("Imagen error", e);
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800";
  }
}

// 4. Text-To-Speech Generation
async function callGeminiTTS(text: string, voiceName: string = "Kore"): Promise<string | null> {
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-tts:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
    }
  };
  try {
    const data = await fetchWithRetry(url, payload);
    return data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data; // PCM16 base64
  } catch(e) {
    console.error("TTS Error", e);
    return null;
  }
}

// Utility: Převod PCM16 base64 do WAV
function pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
  const binaryStr = atob(pcmBase64);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryStr.charCodeAt(i);
  const buffer = bytes.buffer;

  const wavBuffer = new ArrayBuffer(44 + buffer.byteLength);
  const view = new DataView(wavBuffer);
  const writeString = (v: DataView, offset: number, str: string) => { for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + buffer.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, buffer.byteLength, true);
  new Uint8Array(wavBuffer, 44).set(new Uint8Array(buffer));
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// =========================
// EXPRESSION ENGINE
// =========================
function evalPath(path: string, ctx: any) {
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return null;
    const m = key.match(/(\w+)\[(\d+)\]/);
    if (m) return acc[m[1]]?.[Number(m[2])];
    return acc[key];
  }, ctx);
}

function evaluateExpression(expr: string, ctx: any) {
  if (!expr || typeof expr !== 'string') return expr;
  const match = expr.match(/^\{\{(.+)\}\}$/);
  if (!match) return expr;
  return evalPath(match[1].trim(), ctx) || `[Chybí: ${match[1]}]`;
}

// =========================
// CSS & STYLES
// =========================
const styles = {
  bgBase: "bg-slate-950",
  glassPanel: "bg-slate-900/80 backdrop-blur-3xl border border-white/5 shadow-2xl",
  glassCard: "bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-xl rounded-2xl",
  inputGlass: "w-full bg-black/40 border border-white/10 text-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500/60 focus:bg-indigo-500/5 outline-none transition-all placeholder-slate-600",
  primaryBtn: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50",
  secondaryBtn: "bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2.5 px-4 rounded-xl transition-all active:scale-95",
  borderSelected: "ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]",
};

// =========================
// WIDGET REGISTRY
// =========================
const WIDGET_CATEGORIES = ["Rozložení", "✨ Generativní AI", "Obsah", "Prvky"];

const widgetRegistry: WidgetRegistry = {
  section: {
    name: "Oblast (Sekce)",
    category: "Rozložení",
    icon: <Maximize2 size={16} />,
    defaultConfig: { height: "min-h-[300px]", padding: "p-8", style: "glass", borderRadius: "rounded-3xl" },
    isContainer: true,
    render: (config, _, children) => (
      <div className={`w-full ${config.height} ${config.padding} ${config.borderRadius} ${config.style === 'glass' ? styles.glassCard : 'bg-transparent'} flex flex-col gap-6 relative overflow-hidden transition-all duration-700`}>
         {children || <div className="flex-1 flex items-center justify-center text-slate-700 border-2 border-dashed border-white/5 rounded-2xl uppercase tracking-widest text-[10px]">Prázdná sekce</div>}
      </div>
    ),
    editor: (config, update) => (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Výška</label>
          <select className={styles.inputGlass} value={config.height} onChange={e => update({ height: e.target.value })}>
            <option value="h-auto">Auto</option>
            <option value="min-h-[300px]">Malá</option>
            <option value="min-h-[600px]">Střední</option>
            <option value="min-h-screen">Celá obrazovka</option>
          </select>
        </div>
      </div>
    )
  },
  columns: {
    name: "Sloupce (Grid)",
    category: "Rozložení",
    icon: <Columns size={16} />,
    defaultConfig: { cols: "grid-cols-1 md:grid-cols-2", gap: "gap-8" },
    isContainer: true,
    render: (config, _, children) => (
      <div className={`w-full grid ${config.cols} ${config.gap}`}>
        {children || <div className="col-span-full h-20 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-widest">Přidejte sloupce</div>}
      </div>
    ),
    editor: (config, update) => (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Rozložení</label>
          <select className={styles.inputGlass} value={config.cols} onChange={e => update({ cols: e.target.value })}>
            <option value="grid-cols-1">1 sloupec</option>
            <option value="grid-cols-1 md:grid-cols-2">2 sloupce</option>
            <option value="grid-cols-1 md:grid-cols-3">3 sloupce</option>
            <option value="grid-cols-1 md:grid-cols-4">4 sloupce</option>
          </select>
        </div>
      </div>
    )
  },
  aiGenerator: {
    name: "AI Copilot Text",
    category: "✨ Generativní AI",
    icon: <Sparkles size={16} className="text-indigo-400" />,
    defaultConfig: { prompt: "Vytvoř vizi digitální transformace...", content: "Zde se objeví výsledek AI...", isGenerating: false },
    render: (config) => (
      <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 relative group overflow-hidden">
        {config.isGenerating && <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="animate-spin text-indigo-400" /></div>}
        <p className="text-slate-300 leading-relaxed text-sm font-light italic">"{config.content}"</p>
      </div>
    ),
    editor: (config, update) => (
      <div className="space-y-4">
        <textarea className={`${styles.inputGlass} h-24`} value={config.prompt} onChange={e => update({ prompt: e.target.value })} />
        <button className={styles.primaryBtn} onClick={async () => {
          update({ isGenerating: true });
          const text = await callGeminiText(config.prompt);
          update({ content: text, isGenerating: false });
        }}>Generovat</button>
      </div>
    )
  },
  aiImage: {
    name: "AI Vizualizace",
    category: "✨ Generativní AI",
    icon: <ImageIcon size={16} className="text-pink-400" />,
    defaultConfig: { prompt: "Futuristic architecture, cinematic lighting, ultra detailed", url: "", isGenerating: false },
    render: (config) => (
      <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/5 relative group">
        {config.isGenerating && <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-10"><Loader2 className="animate-spin text-pink-400" /></div>}
        {config.url ? <img src={config.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="AI" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2"><ImageIcon size={40} strokeWidth={1} /><span className="text-[10px] uppercase tracking-[0.3em]">AI Vizuál</span></div>}
      </div>
    ),
    editor: (config, update) => (
      <div className="space-y-4">
        <textarea className={styles.inputGlass} value={config.prompt} onChange={e => update({ prompt: e.target.value })} />
        <button className={styles.primaryBtn} onClick={async () => {
          update({ isGenerating: true });
          const img = await callImagen(config.prompt);
          update({ url: img || "", isGenerating: false });
        }}>Vytvořit obraz</button>
      </div>
    )
  },
  aiPalette: {
     name: "AI Barvy",
     category: "✨ Generativní AI",
     icon: <Palette size={16} className="text-emerald-400" />,
     defaultConfig: { prompt: "Hluboký vesmír a neonová světla", colors: ["#0f172a", "#1e1b4b", "#312e81", "#4338ca", "#4f46e5"], isGenerating: false },
     render: (config) => (
       <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
         <div className="flex h-12 rounded-xl overflow-hidden shadow-2xl">
           {config.colors.map((c: string, i: number) => <div key={i} className="flex-1 transition-all hover:flex-[1.5]" style={{backgroundColor: c}} />)}
         </div>
       </div>
     ),
     editor: (config, update) => (
       <div className="space-y-4">
         <input className={styles.inputGlass} value={config.prompt} onChange={e => update({ prompt: e.target.value })} />
         <button className={styles.primaryBtn} onClick={async () => {
            update({ isGenerating: true });
            const res = await callGeminiJSON(`Suggest 5 hex colors for theme: ${config.prompt}`, { colors: { type: "ARRAY", items: { type: "STRING" } } });
            if (res?.colors) update({ colors: res.colors });
            update({ isGenerating: false });
         }}>Navrhnout barvy</button>
       </div>
     )
  },
  aiVoice: {
    name: "AI Hlas",
    category: "✨ Generativní AI",
    icon: <Volume2 size={16} className="text-amber-400" />,
    defaultConfig: { text: "Systém propoj spuštěn.", voice: "Aoede", audioUrl: null, isGenerating: false },
    render: (config) => (
      <button 
        onClick={() => config.audioUrl && new Audio(config.audioUrl).play()}
        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center"><Play size={16} fill="white" /></div>
        <div className="text-left"><div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Hlasová zpráva</div><div className="text-xs text-slate-300 truncate w-40">{config.text}</div></div>
      </button>
    ),
    editor: (config, update) => (
      <div className="space-y-4">
        <textarea className={styles.inputGlass} value={config.text} onChange={e => update({ text: e.target.value })} />
        <button className={styles.primaryBtn} onClick={async () => {
           update({ isGenerating: true });
           const b64 = await callGeminiTTS(config.text, config.voice);
           if (b64) update({ audioUrl: pcmToWav(b64) });
           update({ isGenerating: false });
        }}>Vytvořit zvuk</button>
      </div>
    )
  },
  heading: {
    name: "Nadpis",
    category: "Obsah",
    icon: <Type size={16} />,
    defaultConfig: { text: "Hlavní Myšlenka", level: "h1", align: "text-left" },
    render: (config) => {
      const sizes: any = { h1: "text-5xl font-bold", h2: "text-3xl font-semibold", h3: "text-xl font-medium" };
      return <h1 className={`${sizes[config.level]} ${config.align} text-white tracking-tight leading-none`}>{config.text}</h1>;
    },
    editor: (config, update) => (
      <div className="space-y-4">
        <input className={styles.inputGlass} value={config.text} onChange={e => update({ text: e.target.value })} />
        <select className={styles.inputGlass} value={config.level} onChange={e => update({ level: e.target.value })}>
          <option value="h1">Obrovský</option>
          <option value="h2">Střední</option>
          <option value="h3">Malý</option>
        </select>
      </div>
    )
  },
  text: {
    name: "Odstavec",
    category: "Obsah",
    icon: <Type size={14} strokeWidth={1} />,
    defaultConfig: { text: "Tento text byl vytvořen pomocí AI architektury.", color: "text-slate-400" },
    render: (config) => <p className={`${config.color} text-sm leading-relaxed font-light`}>{config.text}</p>,
    editor: (config, update) => <textarea className={`${styles.inputGlass} h-32`} value={config.text} onChange={e => update({ text: e.target.value })} />
  },
  button: {
    name: "Tlačítko",
    category: "Prvky",
    icon: <Pointer size={16} />,
    defaultConfig: { text: "Akce", variant: "primary" },
    render: (config) => <button className={config.variant === 'primary' ? styles.primaryBtn : styles.secondaryBtn}>{config.text}</button>,
    editor: (config, update) => <input className={styles.inputGlass} value={config.text} onChange={e => update({ text: e.target.value })} />
  },
  card: {
    name: "Informační Karta",
    category: "Prvky",
    icon: <Layout size={16} />,
    defaultConfig: { title: "Modul", content: "Popis modulu", icon: "Server" },
    render: (config) => (
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all group">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Server size={18} className="text-indigo-400" /></div>
        <h3 className="text-white font-bold mb-2 uppercase tracking-wide text-xs">{config.title}</h3>
        <p className="text-slate-400 text-xs font-light leading-relaxed">{config.content}</p>
      </div>
    ),
    editor: (config, update) => (
      <div className="space-y-4">
        <input className={styles.inputGlass} value={config.title} onChange={e => update({ title: e.target.value })} />
        <textarea className={styles.inputGlass} value={config.content} onChange={e => update({ content: e.target.value })} />
      </div>
    )
  },
  spacer: {
    name: "Mezera",
    category: "Rozložení",
    icon: <ArrowDown size={16} />,
    defaultConfig: { size: "h-8" },
    render: (config) => <div className={config.size} />,
    editor: (config, update) => (
      <select className={styles.inputGlass} value={config.size} onChange={e => update({ size: e.target.value })}>
        <option value="h-4">Malá</option>
        <option value="h-8">Střední</option>
        <option value="h-20">Velká</option>
        <option value="h-40">Obrovská</option>
      </select>
    )
  },
  image: {
    name: "Obrázek",
    category: "Obsah",
    icon: <ImageIcon size={16} />,
    defaultConfig: { url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800", borderRadius: "rounded-3xl" },
    render: (config) => <img src={config.url} className={`w-full ${config.borderRadius} shadow-2xl`} alt="Upload" />,
    editor: (config, update) => <input className={styles.inputGlass} value={config.url} onChange={e => update({ url: e.target.value })} />
  },
  list: {
    name: "Seznam",
    category: "Obsah",
    icon: <History size={16} />,
    defaultConfig: { items: ["Bod 1", "Bod 2", "Bod 3"] },
    render: (config) => (
      <ul className="space-y-3">
        {config.items.map((item: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-light">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    ),
    editor: (config, update) => (
      <textarea 
        className={`${styles.inputGlass} h-32`} 
        value={config.items.join('\n')} 
        onChange={e => update({ items: e.target.value.split('\n') })} 
      />
    )
  }
};

// =========================
// MAIN APP COMPONENT
// =========================
export default function Builder() {
  const [tree, setTree] = useState<WidgetNode[]>(() => {
    const saved = localStorage.getItem('propoj-app-tree');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isGeneratingLayout, setIsGeneratingLayout] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [history, setHistory] = useState<WidgetNode[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Appwrite & Analysis State
  const [showConfig, setShowConfig] = useState(false);
  const [appwriteConfig, setAppwriteConfig] = useState({
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: "",
    databaseId: "",
  });
  const [uxAnalysis, setUxAnalysis] = useState<string | null>(null);
  const [isAnalyzingUx, setIsAnalyzingUx] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('propoj-app-tree', JSON.stringify(tree));
  }, [tree]);

  const analyzeDesign = async () => {
    if (tree.length === 0) return;
    setIsAnalyzingUx(true);
    const extractText = (nodes: WidgetNode[]): string => {
      let t = "";
      for (const n of nodes) {
        if (n.config.text) t += n.config.text + " | ";
        if (n.config.title) t += n.config.title + " | ";
        if (n.children) t += extractText(n.children);
      }
      return t;
    };
    const context = extractText(tree);
    const analysis = await callGeminiText(`Jako seniorní UX designér ohodnoť tento webový návrh: "${context}". Dej 3 konkrétní rady pro zlepšení konverze a přehlednosti.`);
    setUxAnalysis(analysis);
    setIsAnalyzingUx(false);
  };

  // History (Undo/Redo)
  const pushHistory = useCallback((newTree: WidgetNode[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newTree]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setTree(history[historyIndex - 1]);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setTree(history[historyIndex + 1]);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const findNode = useCallback((nodes: WidgetNode[], id: string): WidgetNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const updateNode = useCallback((nodes: WidgetNode[], id: string, updater: (n: WidgetNode) => WidgetNode): WidgetNode[] => {
    return nodes.map(node => {
      if (node.id === id) return updater(node);
      if (node.children) return { ...node, children: updateNode(node.children, id, updater) };
      return node;
    });
  }, []);

  const deleteNode = useCallback((nodes: WidgetNode[], id: string): WidgetNode[] => {
    return nodes.filter(node => node.id !== id).map(node => ({
      ...node,
      children: node.children ? deleteNode(node.children, id) : undefined
    }));
  }, []);

  const insertNode = useCallback((nodes: WidgetNode[], targetParentId: string | null, newNode: WidgetNode): WidgetNode[] => {
    if (!targetParentId) return [...nodes, newNode];
    return nodes.map(node => {
      if (node.id === targetParentId) return { ...node, children: [...(node.children || []), newNode] };
      if (node.children) return { ...node, children: insertNode(node.children, targetParentId, newNode) };
      return node;
    });
  }, []);

  const addWidget = (type: WidgetType) => {
    const def = widgetRegistry[type];
    const newNode: WidgetNode = {
      id: `w_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      config: { ...def.defaultConfig },
      layout: { colSpan: 12 },
      ...(def.isContainer ? { children: [] } : {})
    };
    const targetParent = selectedId && widgetRegistry[findNode(tree, selectedId)?.type as WidgetType]?.isContainer ? selectedId : null;
    const newTree = insertNode(tree, targetParent, newNode);
    setTree(newTree);
    pushHistory(newTree);
    setSelectedId(newNode.id);
  };

  const generateLayout = async () => {
    if (!aiPrompt) return;
    setIsGeneratingLayout(true);
    const schema = {
      sections: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            features: { type: "ARRAY", items: { type: "STRING" } }
          }
        }
      }
    };
    const res = await callGeminiJSON(`Build a futuristic landing page layout for: ${aiPrompt}`, schema);
    if (res?.sections) {
      const newNodes: WidgetNode[] = res.sections.map((s: any) => ({
        id: `gen_${Math.random()}`,
        type: 'section',
        config: { height: "h-auto", padding: "p-12", style: "glass", borderRadius: "rounded-[3rem]" },
        layout: { colSpan: 12 },
        children: [
          { id: `t_${Math.random()}`, type: 'heading', config: { text: s.title, level: "h2", align: "text-center" }, layout: { colSpan: 12 } },
          { id: `p_${Math.random()}`, type: 'text', config: { text: s.description, color: "text-slate-400" }, layout: { colSpan: 12 } },
          { 
            id: `c_${Math.random()}`, 
            type: 'columns', 
            config: { cols: "grid-cols-1 md:grid-cols-3", gap: "gap-6" }, 
            layout: { colSpan: 12 },
            children: s.features?.map((f: string) => ({
              id: `f_${Math.random()}`, type: 'card', config: { title: f, content: "Generated feature description" }, layout: { colSpan: 1 }
            }))
          }
        ]
      }));
      const updatedTree = [...tree, ...newNodes];
      setTree(updatedTree);
      pushHistory(updatedTree);
      setShowAiModal(false);
    }
    setIsGeneratingLayout(false);
  };

  const renderCanvas = (nodes: WidgetNode[], parentId: string | null = null): React.ReactNode => {
    return nodes.map(node => {
      const isSelected = selectedId === node.id;
      return (
        <div 
          key={node.id} 
          onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }}
          className={`relative group rounded-3xl transition-all duration-300 ${isSelected ? styles.borderSelected : 'hover:ring-1 hover:ring-white/10'} ${parentId ? '' : `col-span-${node.layout.colSpan}`}`}
        >
          {widgetRegistry[node.type].render(node.config, {}, node.children ? renderCanvas(node.children, node.id) : null)}
          {isSelected && (
            <div className="absolute -top-3 left-6 flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2">
              {widgetRegistry[node.type].icon} {widgetRegistry[node.type].name}
            </div>
          )}
        </div>
      );
    });
  };

  const selectedNode = useMemo(() => selectedId ? findNode(tree, selectedId) : null, [tree, selectedId, findNode]);

  return (
    <div className={`h-screen flex flex-col ${styles.bgBase} text-white font-sans overflow-hidden selection:bg-indigo-500/30`}>
      
      {/* TOOLBAR */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"><Layout size={18} /></div>
            <span className="font-bold tracking-tighter text-xl">PROPOJ<span className="text-indigo-500">.APP</span></span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
             <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Monitor size={16} /></button>
             <button onClick={() => setPreviewMode('tablet')} className={`p-2 rounded-lg transition-all ${previewMode === 'tablet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Tablet size={16} /></button>
             <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Smartphone size={16} /></button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><Undo2 size={18} /></button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><Redo2 size={18} /></button>
          </div>
          <button onClick={() => setShowAiModal(true)} className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-500/20 transition-all"><Wand2 size={16} /> AI Architekt</button>
          <button onClick={() => setShowConfig(true)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10"><Settings size={18} /></button>
          <button className={styles.primaryBtn}><Download size={16} className="inline mr-2" /> Export</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL */}
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} border-r border-white/5 bg-slate-900/50 flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {WIDGET_CATEGORIES.map(cat => (
              <div key={cat}>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{cat}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(widgetRegistry).filter(([_, d]) => d.category === cat).map(([type, d]) => (
                    <button key={type} onClick={() => addWidget(type as WidgetType)} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                      <div className="text-slate-400 group-hover:text-indigo-400 transition-colors mb-2">{d.icon}</div>
                      <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{d.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-white/5">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Layers size={12} /> Vrstvy</div>
             <div className="space-y-1 mb-6">
                {tree.map(n => (
                  <div key={n.id} onClick={() => setSelectedId(n.id)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-all ${selectedId === n.id ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                    <ChevronRight size={12} /> {widgetRegistry[n.type].name}
                  </div>
                ))}
             </div>
             
             <div className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">UX Asistent</h3>
                {uxAnalysis ? (
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] leading-relaxed text-indigo-200">
                    <div className="font-bold text-indigo-400 mb-2 flex items-center gap-2"><Sparkles size={10}/> Doporučení</div>
                    {uxAnalysis}
                    <button onClick={() => setUxAnalysis(null)} className="mt-4 text-slate-500 hover:text-white uppercase tracking-widest text-[8px]">Resetovat analýzu</button>
                  </div>
                ) : (
                  <button onClick={analyzeDesign} disabled={isAnalyzingUx || tree.length === 0} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                    {isAnalyzingUx ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    {isAnalyzingUx ? "Analyzuji..." : "Analyzovat design"}
                  </button>
                )}
             </div>
          </div>
        </aside>

        {/* CANVAS */}
        <main className="flex-1 bg-[#050608] overflow-y-auto p-12 relative flex justify-center items-start custom-scrollbar">
          <div className={`transition-all duration-500 shadow-[0_0_100px_rgba(0,0,0,0.5)] ${previewMode === 'desktop' ? 'w-full max-w-6xl' : previewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'}`}>
             <div className="grid grid-cols-12 gap-8 min-h-[800px] border border-white/5 p-8 rounded-[3rem] bg-slate-950 relative overflow-hidden" onClick={() => setSelectedId(null)}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none" />
                {tree.length === 0 ? (
                  <div className="col-span-12 flex flex-col items-center justify-center text-slate-700 py-40">
                     <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6"><Sparkles size={32} /></div>
                     <p className="text-xl font-light">Prázdné plátno</p>
                     <p className="text-sm opacity-50 mt-2">Přidejte komponentu nebo použijte AI Architekta</p>
                  </div>
                ) : renderCanvas(tree)}
             </div>
          </div>
        </main>

        {/* RIGHT PANEL (INSPECTOR) */}
        <aside className={`${selectedId ? 'w-80' : 'w-0'} border-l border-white/5 bg-slate-900/50 flex flex-col transition-all duration-300 overflow-hidden`}>
          {selectedNode && (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">{widgetRegistry[selectedNode.type].icon}</div>
                    <div><h2 className="text-xs font-bold uppercase tracking-widest">{widgetRegistry[selectedNode.type].name}</h2><p className="text-[10px] text-slate-500">ID: {selectedNode.id.split('_').pop()}</p></div>
                 </div>
                 <button onClick={() => setSelectedId(null)} className="p-2 text-slate-500 hover:text-white"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Vlastnosti</h3>
                    {widgetRegistry[selectedNode.type].editor(selectedNode.config, (u) => setTree(prev => updateNode(prev, selectedNode.id, n => ({...n, config: {...n.config, ...u}}))))}
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Layout</h3>
                    <div className="space-y-4">
                       <div><div className="flex justify-between text-[10px] text-slate-400 mb-2 uppercase tracking-wider"><span>Šířka (Grid)</span><span>{selectedNode.layout.colSpan}/12</span></div><input type="range" min="1" max="12" step="1" className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-indigo-500" value={selectedNode.layout.colSpan} onChange={e => setTree(prev => updateNode(prev, selectedNode.id, n => ({...n, layout: {...n.layout, colSpan: parseInt(e.target.value)}})))} /></div>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-slate-950/50 border-t border-white/5">
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => {
                      const clone = JSON.parse(JSON.stringify(selectedNode));
                      clone.id = `copy_${Date.now()}`;
                      setTree(prev => [...prev, clone]);
                    }} className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"><Copy size={14} /> Klonovat</button>
                    <button onClick={() => {
                      setTree(prev => deleteNode(prev, selectedNode.id));
                      setSelectedId(null);
                    }} className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all"><Trash2 size={14} /> Smazat</button>
                 </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* MODALS */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100] flex items-center justify-center animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] pointer-events-none" />
              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-3"><Wand2 className="text-indigo-400" /> <h2 className="text-xl font-bold">AI Architekt</h2></div>
                 <p className="text-slate-400 text-sm leading-relaxed">Popište vizi své stránky. AI navrhne sekce, napíše texty a vytvoří kompletní strukturu.</p>
                 <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className={`${styles.inputGlass} h-40`} placeholder="Např: Moderní landing page pro kávovou pražírnu s příběhem, výpisem produktů a sekcí s recenzemi..." />
                 <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setShowAiModal(false)} className={styles.secondaryBtn}>Zrušit</button>
                    <button onClick={generateLayout} disabled={isGeneratingLayout || !aiPrompt} className={`${styles.primaryBtn} min-w-[200px] flex items-center justify-center gap-2`}>
                      {isGeneratingLayout ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      {isGeneratingLayout ? 'Navrhuji architekturu...' : 'Vytvořit projekt'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100] flex items-center justify-center animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-3"><Settings size={20} className="text-indigo-400" /> <h2 className="text-xl font-bold">Nastavení Projektu</h2></div>
                 <div className="space-y-4">
                    <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 block">Appwrite Endpoint</label><input className={styles.inputGlass} value={appwriteConfig.endpoint} onChange={e => setAppwriteConfig({...appwriteConfig, endpoint: e.target.value})} /></div>
                    <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 block">Project ID</label><input className={styles.inputGlass} value={appwriteConfig.projectId} onChange={e => setAppwriteConfig({...appwriteConfig, projectId: e.target.value})} /></div>
                    <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 block">Database ID</label><input className={styles.inputGlass} value={appwriteConfig.databaseId} onChange={e => setAppwriteConfig({...appwriteConfig, databaseId: e.target.value})} /></div>
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setShowConfig(false)} className={styles.primaryBtn + " w-full"}>Uložit nastavení</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
