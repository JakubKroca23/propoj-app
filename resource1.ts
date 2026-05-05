import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Settings, Type, Pointer, Image as ImageIcon,
  Layout, Server, X, ArrowUp, ArrowDown, Trash2, Save, Sparkles, Copy, Columns, Maximize2, Palette, Volume2, Loader2, Play, Minimize2, PanelLeftClose, PanelLeftOpen, Wand2, MessageSquare, CheckCircle2
} from "lucide-react";

// =========================
// TYPES & INTERFACES
// =========================
type WidgetType = 'section' | 'columns' | 'aiGenerator' | 'aiImage' | 'aiPalette' | 'aiVoice' | 'heading' | 'text' | 'button' | 'card';

interface WidgetLayout {
  colSpan: number;
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
const apiKey = ""; // Klíč je automaticky injektován prostředím (environment)

async function fetchWithRetry(url: string, payload: any): Promise<any> {
  const delays = [1000, 2000, 4000, 8000, 16000];
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
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

// 3. Image Generation (Imagen 4)
async function callImagen(prompt: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
  const payload = { instances: { prompt }, parameters: { sampleCount: 1 } };
  try {
    const data = await fetchWithRetry(url, payload);
    const base64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (base64) return `data:image/png;base64,${base64}`;
    return null;
  } catch (e) {
    console.error("Imagen error", e);
    return null;
  }
}

// 4. Text-To-Speech Generation
async function callGeminiTTS(text: string, voiceName: string = "Kore"): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
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
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
}

// Utility: Převod PCM16 base64 (z Gemini TTS) do přehrávatelného WAV
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
// APPWRITE RAW REST CLIENT
// =========================
class AppwriteRestClient {
  endpoint: string;
  projectId: string;
  secretKey?: string;

  constructor(endpoint: string, projectId: string, secretKey?: string) {
    this.endpoint = endpoint;
    this.projectId = projectId;
    this.secretKey = secretKey;
  }

  async listDocuments(databaseId: string, collectionId: string) {
    const url = `${this.endpoint}/databases/${databaseId}/collections/${collectionId}/documents`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': this.projectId,
    };
    if (this.secretKey) {
      headers['X-Appwrite-Key'] = this.secretKey;
    }

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error(`Appwrite Error: ${response.statusText}`);
    }
    return response.json();
  }
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
// CSS & STYLES (Glassmorphism & Dark Theme)
// =========================
const styles = {
  bgBase: "bg-[#0b0c10]",
  glassPanel: "bg-[#0b0c10]/80 backdrop-blur-3xl border border-indigo-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]",
  glassPanelHover: "hover:bg-white/[0.04] transition-all duration-300",
  glassCard: "bg-[#0b0c10]/60 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-xl",
  textPrimary: "text-slate-100",
  textSecondary: "text-slate-400",
  accent: "text-indigo-400",
  accentGlow: "drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]",
  primaryBtn: "bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-100 backdrop-blur-md rounded-lg transition-all duration-300 ease-out shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]",
  inputGlass: "w-full bg-black/40 border border-indigo-500/20 text-slate-200 p-2.5 rounded-lg text-sm focus:border-indigo-500/60 focus:bg-white/[0.02] focus:ring-1 focus:ring-indigo-500/60 outline-none transition-all placeholder-slate-600",
  borderSelected: "border-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.3)] bg-indigo-500/[0.05]",
};

// =========================
// WIDGET REGISTRY
// =========================
const WIDGET_CATEGORIES = ["Rozložení", "✨ Generativní AI", "Obsah", "Prvky"];

const widgetRegistry: WidgetRegistry = {
  // --- STRUKTURA ---
  section: {
    name: "Oblast (Sekce)",
    category: "Rozložení",
    icon: <Maximize2 size={ 16} />,
defaultConfig: { height: "min-h-[300px]", padding: "p-4", style: "glass" },
isContainer: true,
  render: (config, _, children) => {
    const bgStyle = config.style === 'glass' ? styles.glassCard : config.style === 'dark' ? 'bg-black/60 border border-indigo-500/20 rounded-xl' : 'bg-transparent';
    return (
      <div className= {`w-full ${config.height} ${config.padding} ${bgStyle} flex flex-col gap-4 relative overflow-hidden transition-all duration-500`
  }>
    { children && (children as React.ReactNode[])?.length > 0 ? children : (
      <div className= "absolute inset-0 flex items-center justify-center text-slate-600/50 font-medium text-xs tracking-widest uppercase" >
  Prázdná oblast
    </div>
           )}
</div>
      );
    },
editor: (config, update) => (
  <div className= "space-y-4" >
  <div>
  <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Styl oblasti </label>
    < select className = { styles.inputGlass } value = { config.style } onChange = { e => update({ style: e.target.value })}>
      <option value="glass" > Glassmorphism </option>
        < option value = "dark" > Temné </option>
          < option value = "transparent" > Neviditelné </option>
            </select>
            </div>
            < div >
            <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Výška </label>
              < select className = { styles.inputGlass } value = { config.height } onChange = { e => update({ height: e.target.value })}>
                <option value="h-auto" > Přizpůsobit obsahu </option>
                  < option value = "min-h-[200px]" > Malá(200px) </option>
                    < option value = "min-h-[400px]" > Střední(400px) </option>
                      < option value = "min-h-screen" > Celá obrazovka </option>
                        </select>
                        </div>
                        </div>
    )
  },
columns: {
  name: "Sloupce (Grid)",
    category: "Rozložení",
      icon: <Columns size={ 16 } />,
  defaultConfig: { cols: "grid-cols-2", gap: "gap-4" },
  isContainer: true,
    render: (config, _, children) => (
      <div className= {`w-full grid ${config.cols} ${config.gap} min-h-[100px] p-2 border border-dashed border-indigo-500/30 rounded-lg`
}>
  { children && (children as React.ReactNode[])?.length > 0 ? children : (
    <div className= "col-span-full flex items-center justify-center text-slate-500/30 text-xs tracking-widest uppercase" >
Vložte prvky
  </div>
        )}
</div>
    ),
editor: (config, update) => (
  <div>
  <label className= "text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Rozložení sloupců </label>
    < select className = { styles.inputGlass } value = { config.cols } onChange = { e => update({ cols: e.target.value })}>
      <option value="grid-cols-1 md:grid-cols-2" > 2 Sloupce(50 / 50) </option>
        < option value = "grid-cols-1 md:grid-cols-3" > 3 Sloupce(33 / 33 / 33) </option>
          < option value = "grid-cols-1 md:grid-cols-4" > 4 Sloupce(25 / 25 / 25 / 25) </option>
            </select>
            </div>
    )
  },

// --- AI NÁSTROJE ---
aiGenerator: {
  name: "Chytrý Text",
    category: "✨ Generativní AI",
      icon: <Sparkles size={ 16 } className = "text-indigo-400" />,
        defaultConfig: { prompt: "Napiš vizi budoucnosti softwarového vývoje...", content: "Zde se objeví vygenerovaný text...", isGenerating: false },
  render: (config) => (
    <div className= {`${styles.glassCard} p-5 relative min-h-[100px] w-full`
}>
{
  config.isGenerating && (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center rounded-xl z-10">
      <Loader2 className="animate-spin text-indigo-400" size = { 24} />
        </div>
           )
}
  < p className = "text-slate-200 text-sm leading-relaxed font-light" > { config.content } </p>
    </div>
    ),
editor: (config, update) => (
  <div className= "space-y-4" >
  <div>
  <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Instrukce pro AI </label>
    < textarea className = {`${styles.inputGlass} h-20 resize-none`} value = { config.prompt } onChange = { e => update({ prompt: e.target.value })} />
      </div>
      < button
className = {`w-full ${styles.primaryBtn} py-2.5 flex justify-center items-center gap-2 disabled:opacity-50 text-xs`}
onClick = { async() => {
  update({ isGenerating: true });
  const text = await callGeminiText(config.prompt);
  update({ content: text, isGenerating: false });
}} disabled = { config.isGenerating } >
  { config.isGenerating ? <Loader2 className="animate-spin" size = { 14} /> : < Sparkles size = { 14} className = "text-indigo-400" />}
{ config.isGenerating ? "Generuji..." : "Vygenerovat text" }
</button>
  </div>
    )
  },
aiImage: {
  name: "AI Obraz (Imagen)",
    category: "✨ Generativní AI",
      icon: <ImageIcon size={ 16 } className = "text-pink-400" />,
        defaultConfig: { prompt: "Abstract glowing glassmorphism shapes, dark background, 4k resolution", url: "", isGenerating: false },
  render: (config) => (
    <div className= {`w-full aspect-video ${styles.glassCard} overflow-hidden flex items-center justify-center relative group`
}>
{
  config.isGenerating && (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-20">
      <Loader2 className="animate-spin text-pink-400" size = { 28} />
        </div>
         )
}
{
  config.url ? (
    <img src= { config.url } className = "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt = "AI Generated" />
         ) : (
    <div className= "text-slate-600 flex flex-col items-center gap-2" >
    <ImageIcon size={ 32 } strokeWidth = { 1} />
      <span className="text-[10px] tracking-widest uppercase font-medium" > Bez obrazu </span>
        </div>
         )
}
</div>
    ),
editor: (config, update) => (
  <div className= "space-y-4" >
  <div>
  <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Popis obrazu(Prompt) </label>
    < textarea className = {`${styles.inputGlass} h-16 resize-none`} value = { config.prompt } onChange = { e => update({ prompt: e.target.value })} />
      </div>
      < button
className = {`w-full ${styles.primaryBtn} py-2.5 flex justify-center items-center gap-2 disabled:opacity-50 text-xs`}
onClick = { async() => {
  update({ isGenerating: true });
  const img = await callImagen(config.prompt);
  update({ url: img || config.url, isGenerating: false });
}} disabled = { config.isGenerating } >
  { config.isGenerating ? <Loader2 className="animate-spin text-pink-400" size = { 14} /> : < ImageIcon size = { 14} className = "text-pink-400" />}
{ config.isGenerating ? "Zhmotňuji..." : "Vytvořit vizuál" }
</button>
  </div>
    )
  },
aiPalette: {
  name: "Barvy (AI JSON)",
    category: "✨ Generativní AI",
      icon: <Palette size={ 16 } className = "text-emerald-400" />,
        defaultConfig: { prompt: "Kybernetické město v noci", colors: ["#0f172a", "#312e81", "#4f46e5", "#818cf8", "#c7d2fe"], isGenerating: false },
  render: (config) => (
    <div className= {`${styles.glassCard} p-5 w-full relative`
}>
{
  config.isGenerating && (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-10 rounded-xl">
      <Loader2 className="animate-spin text-emerald-400" size = { 24} />
        </div>
        )
}
  < div className = "text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium flex items-center gap-1.5" >
    <Palette size={ 12 } className = "text-emerald-400" /> { config.prompt }
      </div>
      < div className = "flex w-full h-12 rounded-lg overflow-hidden shadow-inner border border-indigo-500/20" >
      {
        config.colors.map((c: string, i: number) => (
          <div key= { i } className = "flex-1 transition-all duration-500 hover:flex-[1.5] cursor-pointer group relative" style = {{ backgroundColor: c }} >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm transition-all duration-300" >
          <span className="text-white text-[10px] font-mono tracking-wider" > { c } </span>
            </div>
            </div>
          ))}
</div>
  </div>
    ),
editor: (config, update) => (
  <div className= "space-y-4" >
  <div>
  <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Téma palety </label>
    < input className = { styles.inputGlass } value = { config.prompt } onChange = { e => update({ prompt: e.target.value })} />
      </div>
      < button
className = {`w-full ${styles.primaryBtn} py-2.5 flex justify-center items-center gap-2 disabled:opacity-50 text-xs`}
onClick = { async() => {
  update({ isGenerating: true });
  const schema = { colors: { type: "ARRAY", items: { type: "STRING" } } };
  const res = await callGeminiJSON(`Navrhni vizuální paletu o 5 barvách inspirovanou tématem: "${config.prompt}". Vrať platné hexadecimální kódy jako pole.`, schema);
  if (res && res.colors) update({ colors: res.colors });
  update({ isGenerating: false });
}} disabled = { config.isGenerating } >
  { config.isGenerating ? <Loader2 className="animate-spin text-emerald-400" size = { 14} /> : < Palette size = { 14} className = "text-emerald-400" />}
{ config.isGenerating ? "Analyzuji tóny..." : "Generovat paletu" }
</button>
  </div>
    )
  },
aiVoice: {
  name: "Hlasový Syntetizér",
    category: "✨ Generativní AI",
      icon: <Volume2 size={ 16 } className = "text-amber-400" />,
        defaultConfig: { text: "Vítejte v novém rozhraní.", voice: "Aoede", audioUrl: null, isGenerating: false },
  render: (config) => (
    <div className= {`${styles.glassCard} p-4 flex items-center gap-4 w-full relative overflow-hidden group`
}>
  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500 opacity-50" > </div>
    < button
className = "w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-500/30 transition-all shrink-0"
onClick = {() => { if (config.audioUrl) { const audio = new Audio(config.audioUrl); audio.play(); } }}
        >
  { config.isGenerating ? <Loader2 className="animate-spin text-amber-400" size = { 16} /> : < Play size = { 16} className = { config.audioUrl ? "ml-0.5" : "opacity-30" } />}
</button>
  < div className = "flex-1 truncate" >
    <div className="text-[10px] text-amber-400/80 tracking-widest uppercase font-semibold mb-0.5" > Přehrávač zpráv({ config.voice }) </div>
      < div className = "text-slate-200 text-xs truncate" > { config.text } </div>
        </div>
        </div>
    ),
editor: (config, update) => (
  <div className= "space-y-4" >
  <div>
  <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Zpráva </label>
    < textarea className = {`${styles.inputGlass} h-16 resize-none`} value = { config.text } onChange = { e => update({ text: e.target.value })} />
      </div>
      < div className = "flex gap-3" >
        <div className="flex-1" >
          <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Hlasový model </label>
            < select className = { styles.inputGlass } value = { config.voice } onChange = { e => update({ voice: e.target.value })}>
              <option value="Kore" > Kore(Žena, neutrální) </option>
                < option value = "Aoede" > Aoede(Žena, jasný) </option>
                  < option value = "Fenrir" > Fenrir(Muž, hluboký) </option>
                    < option value = "Charon" > Charon(Muž, vážný) </option>
                      </select>
                      </div>
                      </div>
                      < button
className = {`w-full ${styles.primaryBtn} py-2.5 flex justify-center items-center gap-2 disabled:opacity-50 text-xs`}
disabled = { config.isGenerating }
onClick = { async() => {
  update({ isGenerating: true });
  const base64 = await callGeminiTTS(config.text, config.voice);
  if (base64) {
    const url = pcmToWav(base64);
    update({ audioUrl: url, isGenerating: false });
  } else {
    update({ isGenerating: false });
  }
}}>
  { config.isGenerating ? <Loader2 className="animate-spin text-amber-400" size = { 14} /> : < Volume2 size = { 14} className = "text-amber-400" />}
{ config.isGenerating ? "Syntetizuji..." : "Syntetizovat zvuk" }
</button>
  </div>
    )
  },

// --- TYPOGRAFIE ---
heading: {
  name: "Skleněný Nadpis",
    category: "Obsah",
      icon: <Type size={ 16 } />,
  defaultConfig: { text: "Nová Éra", level: "h1", align: "text-left", expression: "", isGenerating: false },
  render: (config, data) => {
    const Tag = config.level || "h2";
    const stylesMap: Record<string, string> = {
      h1: "text-4xl md:text-5xl font-semibold tracking-tight",
      h2: "text-2xl md:text-3xl font-medium tracking-tight",
      h3: "text-lg md:text-xl font-medium"
    };
    const textToDisplay = config.expression ? evaluateExpression(config.expression, data) : config.text;
    return (
      <div className= "relative w-full" >
      <Tag className={ `${stylesMap[config.level]} text-white ${config.align} w-full drop-shadow-md ${config.isGenerating ? 'opacity-50' : ''}` }> { textToDisplay } </Tag>
        </div>
      );
  },
    editor: (config, update) => (
      <div className= "space-y-4" >
      <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Obsah nadpisu </label>
        < input className = { styles.inputGlass } value = { config.text } onChange = { e => update({ text: e.target.value })
} />
  </div>
  < button
className = {`w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
disabled = { config.isGenerating }
onClick = { async() => {
  update({ isGenerating: true });
  const result = await callGeminiText(`Navrhni profesionální, úderný a moderní krátký nadpis (max 5 slov) pro tento text: "${config.text}". Vrať POUZE výsledek bez úvozovek.`);
  update({ text: result, isGenerating: false });
}}
        >
  <Sparkles size={ 12 } className = "text-indigo-400" />
    { config.isGenerating ? "AI Přemýšlí..." : "✨ AI: Vylepšit nadpis" }
    </button>
    < div >
    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Výraz(Expression) </label>
      < input className = {`${styles.inputGlass} font-mono text-xs`} placeholder = "{{data.title}}" value = { config.expression || "" } onChange = { e => update({ expression: e.target.value })} />
        </div>
        < div className = "grid grid-cols-2 gap-3" >
          <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Velikost </label>
            < select className = { styles.inputGlass } value = { config.level } onChange = { e => update({ level: e.target.value })}>
              <option value="h1" > H1 Obrovský </option>
                < option value = "h2" > H2 Střední </option>
                  < option value = "h3" > H3 Malý </option>
                    </select>
                    </div>
                    < div >
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Zarovnání </label>
                      < select className = { styles.inputGlass } value = { config.align } onChange = { e => update({ align: e.target.value })}>
                        <option value="text-left" > Vlevo </option>
                          < option value = "text-center" > Na střed </option>
                            < option value = "text-right" > Vpravo </option>
                              </select>
                              </div>
                              </div>
                              </div>
    )
  },
text: {
  name: "Základní Text",
    category: "Obsah",
      icon: <Type size={ 16 } strokeWidth = { 1} />,
        defaultConfig: { text: "Vaše myšlenky...", color: "text-slate-300", expression: "", isGenerating: false },
  render: (config, data) => {
    const textToDisplay = config.expression ? evaluateExpression(config.expression, data) : config.text;
    return <p className={ `${config.color} text-sm leading-relaxed font-light w-full ${config.isGenerating ? 'opacity-50 animate-pulse' : ''}` }> { textToDisplay } </p>;
  },
    editor: (config, update) => (
      <div className= "space-y-4" >
      <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Text </label>
        < textarea className = {`${styles.inputGlass} h-24 resize-none`
} value = { config.text } onChange = { e => update({ text: e.target.value })} />
  </div>
  < button
className = {`w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
disabled = { config.isGenerating }
onClick = { async() => {
  update({ isGenerating: true });
  const result = await callGeminiText(`Jako expert na copywriting a UX přepiš následující text tak, aby zněl moderněji, profesionálněji a srozumitelně. Výsledek ať je v češtině. Zde je text: "${config.text}". Vrať POUZE výsledek.`);
  update({ text: result, isGenerating: false });
}}
        >
  <Sparkles size={ 12 } className = "text-indigo-400" />
    { config.isGenerating ? "Zpracovávám..." : "✨ AI: Zlepšit text" }
    </button>
    < div >
    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Výraz(Expression) </label>
      < input className = {`${styles.inputGlass} font-mono text-xs`} placeholder = "{{data.description}}" value = { config.expression || "" } onChange = { e => update({ expression: e.target.value })} />
        </div>
        </div>
    )
  },

// --- ELEMENTY ---
button: {
  name: "Tlačítko",
    category: "Prvky",
      icon: <Pointer size={ 16 } />,
  defaultConfig: { text: "Pokračovat", style: "glass" },
  render: (config) => {
    const base = "px-6 py-2.5 rounded-lg font-medium tracking-wide text-xs transition-all duration-300 w-fit backdrop-blur-md border";
    const btnStyles: Record<string, string> = {
      glass: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]",
      primary: "bg-indigo-600 hover:bg-indigo-500 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]",
    };
    return <button className={ `${base} ${btnStyles[config.style]}` }> { config.text } </button>;
  },
    editor: (config, update) => (
      <div className= "space-y-4" >
      <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Popisek </label>
        < input className = { styles.inputGlass } value = { config.text } onChange = { e => update({ text: e.target.value })
} />
  </div>
  < div >
  <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Vzhled </label>
    < select className = { styles.inputGlass } value = { config.style } onChange = { e => update({ style: e.target.value })}>
      <option value="glass" > Skleněný </option>
        < option value = "primary" > Primární(Indigo) </option>
          </select>
          </div>
          </div>
    )
  },
card: {
  name: "Karta (Widget)",
    category: "Prvky",
      icon: <Layout size={ 16 } />,
  defaultConfig: { title: "Systémový Modul", content: "Data stream aktivní.", expressionTitle: "", expressionContent: "" },
  render: (config, data) => {
    const titleToDisplay = config.expressionTitle ? evaluateExpression(config.expressionTitle, data) : config.title;
    const contentToDisplay = config.expressionContent ? evaluateExpression(config.expressionContent, data) : config.content;
    return (
      <div className= {`${styles.glassCard} p-5 w-full h-full flex flex-col gap-2 group`
  }>
    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform" >
      <Server size={ 14 } className = "text-indigo-400" />
        </div>
        < h3 className = "font-medium text-sm text-white tracking-wide" > { titleToDisplay } </h3>
          < p className = "text-slate-400 text-xs leading-relaxed font-light" > { contentToDisplay } </p>
            </div>
        );
},
editor: (config, update) => (
  <div className= "space-y-4" >
  <div>
  <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Nadpis karty </label>
    < input className = { styles.inputGlass } value = { config.title } onChange = { e => update({ title: e.target.value })} />
      </div>
      < div >
      <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Nadpis(Expression) </label>
        < input className = {`${styles.inputGlass} font-mono text-xs`} placeholder = "{{data.title}}" value = { config.expressionTitle || "" } onChange = { e => update({ expressionTitle: e.target.value })} />
          </div>
          < div >
          <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Popis </label>
            < textarea className = {`${styles.inputGlass} h-16 resize-none`} value = { config.content } onChange = { e => update({ content: e.target.value })} />
              </div>
              < div >
              <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider" > Popis(Expression) </label>
                < input className = {`${styles.inputGlass} font-mono text-xs`} placeholder = "{{data.description}}" value = { config.expressionContent || "" } onChange = { e => update({ expressionContent: e.target.value })} />
                  </div>
                  </div>
    )
  }
};

// =========================
// MAIN APP COMPONENT
// =========================
export default function App() {
  const [tree, setTree] = useState<WidgetNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Appwrite Config & State
  const [showConfig, setShowConfig] = useState(false);
  const [appwriteConfig, setAppwriteConfig] = useState({
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: "",
    databaseId: "",
    secretKey: ""
  });
  const [mockData, setMockData] = useState({ data: { jmeno: "Jan Novák", role: "Administrátor", title: "Ukázkový Titulek", description: "Toto je data z kontextu." } });

  // Custom UI Toasts
  const [toastMessage, setToastMessage] = useState<{ title: string, message?: string } | null>(null);

  const showToast = (title: string, message?: string) => {
    setToastMessage({ title, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // AI Layout Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingLayout, setIsGeneratingLayout] = useState(false);

  // UX Assistant State
  const [uxAnalysis, setUxAnalysis] = useState<string | null>(null);
  const [isAnalyzingUx, setIsAnalyzingUx] = useState(false);

  // Inicializace "Appwrite" Clienta (vlastní implementace přes REST)
  const appwriteClient = useMemo(() => {
    if (!appwriteConfig.projectId || !appwriteConfig.endpoint) return null;
    return new AppwriteRestClient(appwriteConfig.endpoint, appwriteConfig.projectId, appwriteConfig.secretKey);
  }, [appwriteConfig.projectId, appwriteConfig.endpoint, appwriteConfig.secretKey]);

  const loadDataFromAppwrite = async (collectionId: string) => {
    if (!appwriteClient || !appwriteConfig.databaseId) {
      showToast("Chyba konfigurace", "Není nastaven Appwrite Client nebo Database ID.");
      return;
    }
    try {
      const res = await appwriteClient.listDocuments(appwriteConfig.databaseId, collectionId);
      console.log("Appwrite Data:", res);
      showToast("Úspěch", `Načteno ${res.total} dokumentů.`);
    } catch (e: any) {
      showToast("Chyba API", "Chyba při načítání dat: " + e.message);
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

  const deleteNodeObj = useCallback((nodes: WidgetNode[], id: string): WidgetNode[] => {
    return nodes.filter(node => node.id !== id).map(node => ({
      ...node,
      children: node.children ? deleteNodeObj(node.children, id) : undefined
    }));
  }, []);

  const insertNodeInto = useCallback((nodes: WidgetNode[], targetParentId: string | null, newNode: WidgetNode): WidgetNode[] => {
    if (!targetParentId) return [...nodes, newNode];
    return nodes.map(node => {
      if (node.id === targetParentId) {
        return { ...node, children: [...(node.children || []), newNode] };
      }
      if (node.children) {
        return { ...node, children: insertNodeInto(node.children, targetParentId, newNode) };
      }
      return node;
    });
  }, []);

  const addWidget = (type: WidgetType) => {
    const def = widgetRegistry[type];
    const newWidget: WidgetNode = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      config: { ...def.defaultConfig },
      layout: { colSpan: 12 },
      ...(def.isContainer ? { children: [] } : {})
    };

    const targetParent = selectedId && widgetRegistry[findNode(tree, selectedId)?.type as WidgetType]?.isContainer ? selectedId : null;
    setTree(prev => insertNodeInto(prev, targetParent, newWidget));
    setSelectedId(newWidget.id);
    setUxAnalysis(null); // Reset UX analysis on change
  };

  const generateAILayout = async () => {
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
            features: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: { title: { type: "STRING" }, content: { type: "STRING" } }
              }
            }
          }
        }
      }
    };

    const res = await callGeminiJSON(`Jako expert na webový design a UI architekturu vytvoř strukturu pro zadaný požadavek. Zahrn sekce a pro každou vymysli vhodný titulek, popis a případně pole několika vlastností (features). Požadavek: "${aiPrompt}"`, schema);

    if (res && res.sections) {
      const newTree: WidgetNode[] = [];
      res.sections.forEach((sec: any) => {
        const sectionId = `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const children: WidgetNode[] = [];

        children.push({
          type: 'heading', id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          config: { text: sec.title || 'Sekce', level: 'h2', align: 'text-center' }, layout: { colSpan: 12 }
        });

        if (sec.description) {
          children.push({
            type: 'text', id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            config: { text: sec.description, color: 'text-slate-300' }, layout: { colSpan: 12 }
          });
        }

        if (sec.features && sec.features.length > 0) {
          const colChildren: WidgetNode[] = sec.features.map((f: any) => ({
            type: 'card', id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            config: { title: f.title, content: f.content }, layout: { colSpan: 1 }
          }));
          children.push({
            type: 'columns', id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            config: { cols: `grid-cols-1 md:grid-cols-${Math.min(sec.features.length, 4)}`, gap: 'gap-6' },
            layout: { colSpan: 12 }, children: colChildren
          });
        }

        newTree.push({
          type: 'section', id: sectionId, config: { height: 'h-auto', padding: 'p-8', style: 'glass' },
          layout: { colSpan: 12 }, children
        });
      });

      setTree(prev => [...prev, ...newTree]);
      showToast("Rozvržení vygenerováno", "AI architekt úspěšně dokončil návrh sekcí.");
      setShowAiModal(false);
      setAiPrompt("");
      setUxAnalysis(null);
    } else {
      showToast("Chyba AI", "Nepodařilo se vygenerovat validní strukturu.");
    }
    setIsGeneratingLayout(false);
  };

  const analyzeDesign = async () => {
    if (tree.length === 0) return;
    setIsAnalyzingUx(true);

    // Extrahovat texty pro kontext
    const extractText = (nodes: WidgetNode[]): string => {
      let t = "";
      for (const n of nodes) {
        if (n.config.text) t += n.config.text + " | ";
        if (n.config.title) t += n.config.title + " | ";
        if (n.config.content) t += n.config.content + " | ";
        if (n.children) t += extractText(n.children);
      }
      return t;
    };

    const allText = extractText(tree);
    const analysis = await callGeminiText(`Jako seniorní UX designér ohodnoť kvalitu tohoto návrhu na základě obsaženého textu a struktury. Dej velmi stručnou 3 větnou zpětnou vazbu a co by šlo vylepšit (v češtině). Zde je obsah UI: "${allText}"`);

    setUxAnalysis(analysis);
    setIsAnalyzingUx(false);
  };

  const renderTree = (nodes: WidgetNode[], parentId: string | null = null): React.ReactNode => {
    return nodes.map(node => {
      const def = widgetRegistry[node.type];
      if (!def) return null;
      const isSelected = selectedId === node.id;

      return (
        <div
          key= { node.id }
      onClick = {(e) => { e.stopPropagation(); setSelectedId(node.id); }
}
className = {`
            ${parentId ? '' : `col-span-${node.layout.colSpan || 12}`} 
            relative group rounded-xl transition-all duration-300 cursor-pointer border-[1px]
            ${isSelected ? styles.borderSelected : 'border-transparent hover:border-indigo-500/30'}
          `}
        >
  <div className={ `p-1 ${def.isContainer ? 'min-h-[60px]' : ''}` }>
  {
    def.render(
      node.config,
      mockData, // Předání datového kontextu pro evaluaci výrazů
      node.children ? renderTree(node.children, node.id) : null
    )
  }
    </div>

{
  isSelected && (
    <div className="absolute -top-3.5 -left-1.5 bg-indigo-600/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-md shadow-[0_4px_12px_rgba(99,102,241,0.5)] z-20 flex items-center gap-1.5 backdrop-blur-md" >
      { def.icon } { def.name }
  </div>
          )
}
</div>
      );
    });
  };

const selectedNode = useMemo(() => selectedId ? findNode(tree, selectedId) : null, [tree, selectedId, findNode]);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, []);

return (
  <div className= {`min-h-screen ${styles.bgBase} flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden relative`}>

    {/* Background Effect */ }
    < div className = "absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" > </div>

{/* HEADER */ }
<header className={ `${styles.glassPanel} h-14 flex items-center justify-between px-6 z-30 border-b-0` }>
  <div className="flex items-center gap-4 relative" >
    <button 
            onClick={ () => setIsSidebarOpen(!isSidebarOpen) }
className = "w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center transition-all"
  >
  { isSidebarOpen?<PanelLeftClose size = { 14 } /> : <PanelLeftOpen size={ 14 } />}
</button>
  < div className = "w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.5)]" >
    <Layout size={ 14 } className = "text-white" />
      </div>
      < h1 className = "font-bold text-base tracking-widest text-white uppercase" >
        PROPOJ.APP
        </h1>
        </div>
        < div className = "flex items-center gap-3" >
          <button 
            onClick={ () => setShowAiModal(true) }
className = "h-8 px-4 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 text-indigo-100 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] gap-2 text-xs font-bold tracking-wider"
  >
  <Wand2 size={ 14 } />
            AI Architekt
  </button>
  < div className = "h-4 w-px bg-white/10 mx-1" > </div>
    < button
onClick = { toggleFullscreen }
className = "w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center transition-all"
title = "Přepnout na celou obrazovku"
  >
  { isFullscreen?<Minimize2 size = { 14 } /> : <Maximize2 size={ 14 } />}
</button>
  < button
onClick = {() => setShowConfig(true)}
className = "w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center transition-all"
title = "Nastavení Appwrite"
  >
  <Settings size={ 14 } />
    </button>
    < button className = {`${styles.primaryBtn} px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5`}>
      <Save size={ 12 } /> Uložit projekt
        </button>
        </div>
        </header>

        < div className = "flex flex-1 overflow-hidden z-20" >

          {/* LEVÝ PANEL (Knihovna) */ }
          < aside
className = {`${styles.glassPanel} flex flex-col z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full border-0'}`}
        >
  <div className="p-4 border-b border-indigo-500/20 bg-black/20" >
    <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase" > Knihovna prvků </h2>
      </div>

      < div className = "p-4 space-y-6 overflow-y-auto custom-scrollbar" >
      {
        WIDGET_CATEGORIES.map(category => {
          const items = Object.entries(widgetRegistry).filter(([_, def]) => def.category === category);
          if (items.length === 0) return null;
          const isAI = category.includes("AI");

          return (
            <div key= { category } >
            <div className={ `text-[9px] font-bold tracking-[0.15em] uppercase mb-3 ${isAI ? "text-indigo-400 flex items-center gap-1" : "text-slate-500"}` }>
              { isAI && <Sparkles size={ 10 } />
        } { category }
        </div>
        < div className = "grid grid-cols-2 gap-2" >
        {
          items.map(([type, def]) => (
            <button
                          key= { type }
                          onClick = {() => addWidget(type as WidgetType)}
                          className = {`flex flex-col items-center justify-center p-3 rounded-xl border-[1px] ${styles.glassHover} group relative overflow-hidden ${isAI ? 'bg-indigo-500/[0.05] border-indigo-500/30 hover:border-indigo-500/60 text-indigo-200' : 'bg-white/[0.02] border-indigo-500/20 hover:border-indigo-500/40 text-slate-300'}`}
        >
        <div className={ `mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${isAI ? 'text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]' : 'text-slate-400'}` }>
          { def.icon }
          </div>
          < span className = "text-[9px] font-medium text-center tracking-wider uppercase" > { def.name } </span>
            </button>
                    ))}
</div>
  </div>
              );
            })}
</div>
  </aside>

{/* PRACOVNÍ PLOCHA (Canvas) */ }
<main 
          className="flex-1 p-6 overflow-y-auto relative custom-scrollbar scroll-smooth"
onClick = {() => setSelectedId(null)}
        >
  <div className="max-w-6xl mx-auto min-h-[700px] relative z-10 pb-20" >
  {
    tree.length === 0 ? (
      <div className= "h-[500px] w-full flex flex-col items-center justify-center text-slate-500 py-40 border-[1px] border-dashed border-indigo-500/30 rounded-2xl bg-black/20 backdrop-blur-sm" >
      <div className="w-16 h-16 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 shadow-inner">
        <Layout size={ 24 } className = "opacity-60 text-indigo-400" strokeWidth = { 1.5} />
          </div>
          < p className = "text-lg font-light tracking-wide text-slate-300" > Pracovní plocha je připravena </p>
            < p className = "text-xs mt-2 text-slate-500 font-light mb-6" > Vyberte prvek z levého panelu nebo nechte tvořit AI.</p>
              < button
onClick = {(e) => { e.stopPropagation(); setShowAiModal(true); }}
className = {`${styles.primaryBtn} px-6 py-3 flex items-center gap-2`}
                >
  <Wand2 size={ 16 } /> Vytvořit celý layout pomocí AI
    </button>
    </div>
            ) : (
  <div className= "grid grid-cols-12 gap-4 auto-rows-min" >
  { renderTree(tree) }
  </div>
            )}
</div>
  </main>

{/* PRAVÝ PANEL (Inspector) */ }
<aside className={ `w-[300px] ${styles.glassPanel} flex flex-col z-20 transition-all duration-300 ease-in-out border-l border-indigo-500/20 ${selectedNode ? 'translate-x-0' : 'translate-x-0'}` }>
  <div className="p-4 border-b border-indigo-500/20 bg-black/20 flex justify-between items-center" >
    <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase" > { selectedNode? "Inspektor": "AI Asistent" } </h2>
{
  selectedNode && (
    <button onClick={ () => setSelectedId(null) } className = "text-slate-500 hover:text-slate-300" >
      <X size={ 14 }/>
        </button>
            )
}
</div>

  < div className = "p-4 flex-1 overflow-y-auto custom-scrollbar" >
  {
    selectedNode?(
              <div className = "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" >
        {/* Header vybraného prvku */ }
        < div className = "flex items-center gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30" >
          <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-300">
    { widgetRegistry[selectedNode.type].icon }
    </div>
    < div >
    <h3 className="font-semibold text-xs text-indigo-100 tracking-wide uppercase" > { widgetRegistry[selectedNode.type].name } </h3>
      < p className = "text-[9px] text-indigo-400/60 font-mono mt-0.5" > ID: { selectedNode.id.split('_').pop() } </p>
        </div>
        </div>

{/* Dynamický editor */ }
<div className="space-y-4" >
  <h4 className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase pb-1.5 border-b border-indigo-500/20" > Konfigurace </h4>
{
  widgetRegistry[selectedNode.type].editor(
    selectedNode.config,
    (updates) => setTree(prev => updateNode(prev, selectedNode.id, n => ({ ...n, config: { ...n.config, ...updates } })))
  )
}
</div>

{/* Nastavení layoutu */ }
<div className="space-y-4" >
  <h4 className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase pb-1.5 border-b border-indigo-500/20" > Rozvržení </h4>
    < div >
    <div className="flex justify-between items-center mb-2" >
      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider" > Šířka modulu </label>
        < span className = "text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded" > { selectedNode.layout.colSpan } / 12 </span>
          </div>
          < input
type = "range" min = "1" max = "12" step = "1"
className = "w-full accent-indigo-500 bg-black/60 rounded-full appearance-none h-1"
value = { selectedNode.layout.colSpan }
onChange = {(e) => {
  const newSpan = parseInt(e.target.value);
  setTree(prev => updateNode(prev, selectedNode.id, n => ({ ...n, layout: { ...n.layout, colSpan: newSpan } })));
}}
                    />
  </div>
  </div>

{/* Akce */ }
<div className="pt-4 border-t border-indigo-500/20" >
  <div className="grid grid-cols-2 gap-2" >
    <button onClick={
      () => {
        const clone = JSON.parse(JSON.stringify(selectedNode));
        clone.id = `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        setTree(prev => [...prev, clone]);
      }
} className = "bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 py-2 rounded-lg flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-wider transition-colors" >
  <Copy size={ 12 } /> Klonovat
    </button>
    < button onClick = {() => {
  setTree(prev => deleteNodeObj(prev, selectedNode.id));
  setSelectedId(null);
}} className = "bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-2 rounded-lg flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-wider transition-colors" >
  <Trash2 size={ 12 } /> Smazat
    </button>
    </div>
    </div>
    </div>
            ) : (
  <div className= "h-full flex flex-col items-center justify-center text-slate-500 pb-20 animate-in fade-in duration-300" >
  <MessageSquare className="mb-4 opacity-40 text-indigo-400" size = { 32} strokeWidth = { 1.5} />
    <p className="text-sm font-light text-center px-4 text-slate-300" > Nevíte si rady s návrhem ? </p>
      < p className = "text-[10px] text-center px-6 text-slate-500 mt-2 mb-6 leading-relaxed" >
        Naše UX inteligence zhodnotí aktuální obsah pracovní plochy a navrhne zlepšení pro zvýšení srozumitelnosti.
                </p>

{
  uxAnalysis ? (
    <div className= "w-full bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-xs text-indigo-100/90 leading-relaxed text-left relative shadow-inner" >
    <CheckCircle2 size={ 16 } className = "text-emerald-400 absolute top-3 right-3 opacity-50" />
      <div className="font-bold uppercase tracking-wider text-[10px] text-indigo-400 mb-2" > Výstup Analýzy </div>
  { uxAnalysis }
  </div>
                ) : (
    <button 
                    onClick= { analyzeDesign }
  disabled = { isAnalyzingUx || tree.length === 0
}
className = {`${styles.primaryBtn} w-full py-3 flex items-center justify-center gap-2 disabled:opacity-30`}
                  >
  { isAnalyzingUx?<Loader2 size = { 16 } className = "animate-spin" /> : <Sparkles size={ 16 } />}
{ isAnalyzingUx ? "Analyzuji..." : "Analyzovat návrh (UX)" }
</button>
                )}
</div>
            )}
</div>
  </aside>
  </div>

{/* MODAL: AI Architekt (Gemini JSON) */ }
{
  showAiModal && (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-xl animate-in fade-in" >
      <div className="bg-[#0b0c10] border border-indigo-500/50 rounded-2xl shadow-[0_8px_32px_0_rgba(99,102,241,0.3)] w-full max-w-lg overflow-hidden relative" >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/30 blur-[60px] rounded-full pointer-events-none" > </div>

          < div className = "bg-indigo-900/20 border-b border-indigo-500/20 px-6 py-4 flex items-center justify-between" >
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider" >
              <Wand2 size={ 16 } className = "text-indigo-400" />
                AI Architekt Plátna
                  </h2>
                  < button onClick = {() => setShowAiModal(false)
} className = "text-slate-500 hover:text-white transition-colors" >
  <X size={ 16 } />
    </button>
    </div>

    < div className = "p-6 space-y-4 relative z-10" >
      <p className="text-xs text-slate-300 leading-relaxed font-light" >
        Popište slovně, jakou webovou stránku či rozložení chcete vytvořit.AI vygeneruje sekce, texty, nadpisy a připraví celou strukturu přímo na vaši plochu.
                </p>
          < div >
          <label className="text-[10px] font-bold text-indigo-400 block mb-1.5 uppercase tracking-wider" > Představa projektu </label>
            < textarea
value = { aiPrompt }
onChange = { e => setAiPrompt(e.target.value) }
placeholder = "Např: Vytvoř moderní landing page pro novou fitness aplikaci. Chci úvodní hero sekci a pod tím 3 karty s výhodami (sledování tepu, plánování jídel, komunita)."
className = {`${styles.inputGlass} h-32 resize-none leading-relaxed`}
                  />
  </div>
  </div>

  < div className = "px-6 py-4 bg-white/[0.02] border-t border-indigo-500/20 flex justify-end relative z-10" >
    <button 
                 onClick={ generateAILayout }
disabled = { isGeneratingLayout || !aiPrompt}
className = {`${styles.primaryBtn} px-6 py-2.5 text-xs font-bold tracking-wider uppercase flex items-center gap-2 disabled:opacity-50 w-full justify-center`}
               >
  { isGeneratingLayout?<Loader2 size = { 16 } className = "animate-spin" /> : <Sparkles size={ 16 } />}
{ isGeneratingLayout ? "Generuji architekturu (může to chvíli trvat)..." : "Vygenerovat kompletní návrh" }
</button>
  </div>
  </div>
  </div>
       )}

{/* MODAL: Skrytá konfigurace Appwrite */ }
{
  showConfig && (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-xl" >
      <div className="bg-[#0b0c10] border border-indigo-500/30 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] w-full max-w-md overflow-hidden relative" >

        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/20 blur-[60px] rounded-full pointer-events-none" > </div>

          < div className = "bg-white/[0.02] border-b border-indigo-500/20 px-6 py-4 flex items-center justify-between" >
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider" >
              <Server size={ 16 } className = "text-indigo-400" />
                Appwrite Konfigurace
                  </h2>
                  < button onClick = {() => setShowConfig(false)
} className = "text-slate-500 hover:text-white transition-colors" >
  <X size={ 16 } />
    </button>
    </div>

    < div className = "p-6 space-y-4 relative z-10" >
      <div>
      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider" > API Endpoint </label>
        < input
type = "text"
value = { appwriteConfig.endpoint }
onChange = { e => setAppwriteConfig({ ...appwriteConfig, endpoint: e.target.value })}
className = { styles.inputGlass }
  />
  </div>

  < div >
  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider" > Project ID </label>
    < input
type = "text"
placeholder = "např. 64a1b2c3d4e5f"
value = { appwriteConfig.projectId }
onChange = { e => setAppwriteConfig({ ...appwriteConfig, projectId: e.target.value })}
className = {`${styles.inputGlass} font-mono`}
                />
  </div>

  < div >
  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider" > Database ID </label>
    < input
type = "text"
value = { appwriteConfig.databaseId }
onChange = { e => setAppwriteConfig({ ...appwriteConfig, databaseId: e.target.value })}
className = {`${styles.inputGlass} font-mono`}
                />
  </div>

  < div >
  <label className="text-[10px] font-bold text-slate-400 block mb-1 flex justify-between uppercase tracking-wider" >
    <span>API Secret Key </span>
      < span className = "text-[8px] uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 tracking-widest" > Full Access </span>
        </label>
        < input
type = "password"
placeholder = "Skrytý klíč pro plný přístup"
value = { appwriteConfig.secretKey }
onChange = { e => setAppwriteConfig({ ...appwriteConfig, secretKey: e.target.value })}
className = {`${styles.inputGlass} border-red-500/30 focus:border-red-500/60 focus:ring-red-500/60 font-mono`}
                />
  </div>

  < button
onClick = {() => loadDataFromAppwrite("test-collection-id")}
className = "w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors mt-2"
  >
  Otestovat připojení k databázi
    </button>

    </div>

    < div className = "px-6 py-4 bg-white/[0.02] border-t border-indigo-500/20 flex justify-end relative z-10" >
      <button 
                onClick={ () => setShowConfig(false) }
className = {`${styles.primaryBtn} px-6 py-2 text-xs font-bold tracking-wider uppercase`}
              >
  Uložit a zavřít
    </button>
    </div>
    </div>
    </div>
      )}

{/* GLOBAL TOAST NOTIFICATION */ }
{
  toastMessage && (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300" >
      <div className="bg-indigo-900/90 backdrop-blur-xl border border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.4)] rounded-full px-6 py-3 flex items-center gap-3 min-w-[300px]" >
        <CheckCircle2 size={ 18 } className = "text-emerald-400" />
          <div>
          <div className="text-xs font-bold text-white tracking-wider uppercase" > { toastMessage.title } </div>
  { toastMessage.message && <div className="text-[10px] text-indigo-200 mt-0.5" > { toastMessage.message } </div> }
  </div>
    </div>
    </div>
      )
}

<style dangerouslySetInnerHTML={
  {
    __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }
      `}
} />
  </div>
  );
}