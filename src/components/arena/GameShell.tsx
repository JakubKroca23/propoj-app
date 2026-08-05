"use client";

import { ArrowLeft, Coins } from "lucide-react";
import { useArenaStore } from "@/stores/arenaStore";

type Props = {
  bet: number;
  onBetChange: (v: number) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  action: React.ReactNode;
  sideExtra?: React.ReactNode;
};

export function GameShell({
  bet,
  onBetChange,
  disabled,
  sideExtra,
  action,
  children,
}: Props) {
  const setView = useArenaStore((s) => s.setView);

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-6">
      <button
        type="button"
        onClick={() => setView("lobby")}
        className="mb-4 flex items-center gap-2 self-start text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Zpět do Lobby
      </button>

      <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg md:w-80">
          <h3 className="mb-2 font-bold">Částka sázky</h3>
          <div className="mb-2 flex items-center rounded-lg border border-slate-700 bg-slate-900 p-3">
            <input
              type="number"
              min={1}
              value={bet}
              disabled={disabled}
              onChange={(e) => onBetChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-xl font-bold text-white outline-none"
            />
            <Coins className="ml-2 h-4 w-4 text-yellow-500" />
          </div>
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onBetChange(Math.max(1, +(bet / 2).toFixed(2)))}
              className="flex-1 rounded bg-slate-700 py-2 text-sm font-bold hover:bg-slate-600 disabled:opacity-50"
            >
              1/2
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onBetChange(+(bet * 2).toFixed(2))}
              className="flex-1 rounded bg-slate-700 py-2 text-sm font-bold hover:bg-slate-600 disabled:opacity-50"
            >
              2x
            </button>
          </div>
          {sideExtra}
          <div className="mt-auto">{action}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
