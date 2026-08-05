"use client";

import { Building2, Coins } from "lucide-react";
import { useArenaStore } from "@/stores/arenaStore";

export function Footer() {
  const balance = useArenaStore((s) => s.balance);
  const bots = useArenaStore((s) => s.bots);
  const platformProfit = useArenaStore((s) => s.platformProfit);
  const displayName = useArenaStore((s) => s.displayName);

  const entries = [
    { label: displayName, value: balance, highlight: "text-yellow-400" },
    ...bots.map((b) => ({
      label: b.name,
      value: b.balance,
      highlight: "text-slate-200",
    })),
    {
      label: "Kasino (Zisk)",
      value: platformProfit,
      highlight: "text-green-400",
      labelClass: "text-green-400",
      icon: true,
    },
  ];

  return (
    <footer className="z-20 flex flex-wrap items-center justify-around gap-2 border-t border-slate-800 bg-slate-900 p-3 text-sm shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
      {entries.map((e, i) => (
        <div key={e.label} className="flex items-center gap-4 sm:gap-6">
          {i > 0 && <div className="hidden h-6 w-px bg-slate-700 sm:block" />}
          <div className="flex flex-col items-center">
            <span
              className={`mb-1 text-xs font-bold tracking-wider uppercase ${e.labelClass ?? "text-slate-400"}`}
            >
              {e.label}
            </span>
            <div
              className={`flex items-center gap-1 font-mono font-bold ${e.highlight}`}
            >
              <span>{e.value.toFixed(2)}</span>
              {e.icon ? (
                <Building2 className="h-2.5 w-2.5" />
              ) : (
                <Coins className="h-2.5 w-2.5 text-yellow-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </footer>
  );
}
