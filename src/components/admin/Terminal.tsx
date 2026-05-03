import React, { useState, useRef, useEffect } from 'react';
import { executeTerminalCommand } from '@/api/sidecar';
import { Terminal as TerminalIcon, ChevronRight, Loader2 } from 'lucide-react';

interface LogEntry {
  type: 'cmd' | 'out' | 'err' | 'sys';
  content: string;
  timestamp: Date;
}

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'sys', content: 'STARGATE_OS v2.0.4 - SECURE LINK ESTABLISHED', timestamp: new Date() },
    { type: 'sys', content: 'Type "ls" or "uptime" to begin diagnostic scan.', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentCmd = input.trim();
    setLogs(prev => [...prev, { type: 'cmd', content: currentCmd, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await executeTerminalCommand(currentCmd);
      
      if (response.error) {
        setLogs(prev => [...prev, { type: 'err', content: response.error, timestamp: new Date() }]);
      } else {
        if (response.stdout) setLogs(prev => [...prev, { type: 'out', content: response.stdout, timestamp: new Date() }]);
        if (response.stderr) setLogs(prev => [...prev, { type: 'err', content: response.stderr, timestamp: new Date() }]);
      }
    } catch (error: any) {
      setLogs(prev => [...prev, { type: 'err', content: 'SYSTEM ERROR: Connection to sidecar failed.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-card/80 border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_50px_hsl(var(--primary)/0.15)] flex flex-col h-[600px] max-h-[80vh]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header */}
      <div className="bg-secondary/30 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/80">Command Terminal // Secure_Shell</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/40" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
          <div className="w-2 h-2 rounded-full bg-green-500/40" />
        </div>
      </div>

      {/* Log Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 scrollbar-thin scrollbar-thumb-purple-500/20"
      >
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-muted-foreground/20 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
            <span className={`break-all whitespace-pre-wrap ${
              log.type === 'cmd' ? 'text-primary font-bold' :
              log.type === 'err' ? 'text-destructive' :
              log.type === 'sys' ? 'text-primary/60 italic' :
              'text-foreground/70'
            }`}>
              {log.type === 'cmd' && <ChevronRight size={12} className="inline mr-1" />}
              {log.content}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-primary/50 italic animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            <span>Executing system process...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-secondary/20 border-t border-border flex items-center gap-2">
        <ChevronRight size={16} className="text-primary" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="bg-transparent border-none outline-none flex-1 text-primary placeholder:text-muted-foreground/20"
          placeholder="Enter command..."
          autoFocus
        />
      </form>
    </div>
  );
};

export default Terminal;
