"use client";

import { Building2, ListChecks, X } from "lucide-react";
import { useArenaStore } from "@/stores/arenaStore";

export function RoundSummary() {
  const roundSummary = useArenaStore((s) => s.roundSummary);
  const closeRoundSummary = useArenaStore((s) => s.closeRoundSummary);

  if (!roundSummary) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900/50 p-4">
          <h3 className="gaming-font flex items-center gap-2 text-xl text-white">
            <ListChecks className="h-5 w-5 text-blue-400" /> SHRNUTÍ KOLA
          </h3>
          <button
            type="button"
            onClick={closeRoundSummary}
            className="text-slate-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-900 text-xs tracking-wider text-slate-400 uppercase">
              <th className="p-3 pl-6">Hráč</th>
              <th className="p-3 text-right">Sázka</th>
              <th className="p-3 text-center">Násobitel</th>
              <th className="p-3 pr-6 text-right">Čistý zisk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {roundSummary.map((r) => {
              if (r.isCasino) {
                const netColor = r.net >= 0 ? "text-green-400" : "text-red-400";
                return (
                  <tr
                    key="casino"
                    className="border-t-2 border-slate-700 bg-slate-900"
                  >
                    <td className="flex items-center gap-2 p-3 pl-6 font-bold text-green-400">
                      <Building2 className="h-4 w-4 text-slate-500" /> {r.name}
                    </td>
                    <td className="p-3 text-right font-mono text-xs text-slate-400">
                      Sázky: {r.bet.toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-600">-</td>
                    <td
                      className={`p-3 pr-6 text-right font-mono text-lg font-black ${netColor}`}
                    >
                      {r.net > 0 ? "+" : ""}
                      {r.net.toFixed(2)}
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={r.name}
                  className={
                    r.isMe
                      ? "border-l-2 border-blue-500 bg-slate-800/80"
                      : "hover:bg-slate-700/30"
                  }
                >
                  <td
                    className={`p-3 pl-6 ${r.isMe ? "font-bold text-blue-400" : "text-slate-200"}`}
                  >
                    {r.name}
                    {r.isMe ? " (Ty)" : ""}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-300">
                    {r.bet.toFixed(2)}
                  </td>
                  <td
                    className={`p-3 text-center font-mono ${r.isWin ? "text-yellow-400" : "text-slate-600"}`}
                  >
                    {r.isWin ? `${r.multi}x` : "-"}
                  </td>
                  <td
                    className={`p-3 pr-6 text-right font-mono font-bold ${r.isWin ? "text-green-400" : "text-red-400"}`}
                  >
                    {r.net > 0 ? "+" : ""}
                    {r.net.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-slate-700 bg-slate-900/50 p-4 text-center">
          <button
            type="button"
            onClick={closeRoundSummary}
            className="rounded-lg bg-blue-600 px-8 py-2 font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors hover:bg-blue-500"
          >
            POKRAČOVAT
          </button>
        </div>
      </div>
    </div>
  );
}
