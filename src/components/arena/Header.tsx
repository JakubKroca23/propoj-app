"use client";

import { Gamepad2, Plus, Wallet, Coins } from "lucide-react";
import { useArenaStore } from "@/stores/arenaStore";

export function Header() {
  const balance = useArenaStore((s) => s.balance);
  const syncing = useArenaStore((s) => s.syncing);
  const setView = useArenaStore((s) => s.setView);
  const addFunds = useArenaStore((s) => s.addFunds);

  return (
    <header className="z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-4 shadow-lg">
      <button
        type="button"
        onClick={() => setView("lobby")}
        className="flex cursor-pointer items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <Gamepad2 className="h-5 w-5 text-white" />
        </div>
        <h1 className="gaming-font bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-2xl tracking-wider text-transparent">
          DOPAMINE ARENA
        </h1>
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 shadow-inner">
          <Wallet className="h-4 w-4 text-slate-400" />
          <div className="font-mono text-xl font-bold text-yellow-400">
            {balance.toFixed(2)}
          </div>
          <Coins className="h-4 w-4 text-yellow-500" />
          {syncing && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" title="Sync…" />
          )}
        </div>
        <button
          type="button"
          onClick={addFunds}
          title="Přidat prostředky zdarma"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 transition-colors hover:bg-slate-600"
        >
          <Plus className="h-5 w-5 text-green-400" />
        </button>
      </div>
    </header>
  );
}
