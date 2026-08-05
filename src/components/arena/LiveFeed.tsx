"use client";

import { ChartLine, List, Bot } from "lucide-react";
import { useArenaStore } from "@/stores/arenaStore";

export function LiveFeed() {
  const feed = useArenaStore((s) => s.feed);
  const platformVolume = useArenaStore((s) => s.platformVolume);
  const platformProfit = useArenaStore((s) => s.platformProfit);

  return (
    <aside className="z-10 hidden w-80 flex-col border-l border-slate-800 bg-slate-900 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] lg:flex">
      <div className="border-b border-slate-800 bg-slate-800/50 p-4">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <ChartLine className="h-4 w-4 text-blue-400" /> Statistiky Kasina
        </h3>
        <div className="mt-4">
          <div className="mb-1 text-xs tracking-wider text-slate-400 uppercase">
            Celkový obrat (Sázky)
          </div>
          <div className="flex items-center justify-between font-mono text-xl font-bold text-white">
            <span>{platformVolume.toFixed(2)}</span>
            <span className="text-sm text-yellow-500">🪙</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-xs tracking-wider text-slate-400 uppercase">
            Zisk Kasina (House Edge)
          </div>
          <div className="flex items-center justify-between font-mono text-xl font-bold text-green-400">
            <span>{platformProfit.toFixed(2)}</span>
            <span className="text-sm text-yellow-500">🪙</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <h3 className="flex items-center gap-2 font-bold text-slate-200">
          <List className="h-4 w-4 text-slate-400" /> Živý Feed
        </h3>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
        {feed.length === 0 ? (
          <div className="mt-10 text-center text-sm text-slate-500">
            <Bot className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>
              Zvol si hru a vsázej. Výsledky tvé i ostatních hráčů se zobrazí zde.
            </p>
          </div>
        ) : (
          feed.map((item) => (
            <div
              key={item.id}
              className={`mb-2 flex items-center justify-between rounded-lg border-l-4 p-3 text-sm shadow ${
                item.isWin
                  ? "border-green-500 bg-green-900/20"
                  : "border-red-500 bg-red-900/20"
              }`}
            >
              <div>
                <div className="font-bold text-slate-200">{item.name}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {item.game} • Sázka: {item.bet}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${item.isWin ? "text-green-400" : "text-red-400"}`}
                >
                  {item.isWin ? "+" : ""}
                  {item.payout.toFixed(2)}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${item.isWin ? "text-green-400" : "text-red-400"}`}
                >
                  {item.isWin ? `${item.multi}x` : "Bust"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
