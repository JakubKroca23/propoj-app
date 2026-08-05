"use client";

import { useMemo, useState } from "react";
import { GameShell } from "../GameShell";
import { useArenaStore } from "@/stores/arenaStore";
import { PLINKO_MULTIS, PLINKO_ROWS } from "@/lib/games";

const BIN_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-slate-600",
  "bg-slate-700",
  "bg-slate-600",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
];

type Peg = { x: number; y: number };

export function PlinkoGame() {
  const balance = useArenaStore((s) => s.balance);
  const updateBalance = useArenaStore((s) => s.updateBalance);
  const notify = useArenaStore((s) => s.notify);
  const processRound = useArenaStore((s) => s.processRound);

  const [bet, setBet] = useState(100);
  const [dropping, setDropping] = useState(false);
  const [ball, setBall] = useState<{ x: number; y: number; opacity: number } | null>(null);
  const [result, setResult] = useState<{ multi: number } | null>(null);

  const pegs = useMemo(() => {
    const list: Peg[] = [];
    for (let r = 0; r < PLINKO_ROWS; r++) {
      const numPegs = r + 3;
      for (let p = 0; p < numPegs; p++) {
        const y = 10 + r * (80 / (PLINKO_ROWS - 1));
        const rowWidth = 20 + r * 10;
        const x = 50 - rowWidth / 2 + p * (rowWidth / (numPegs - 1));
        list.push({ x, y });
      }
    }
    return list;
  }, []);

  const drop = () => {
    if (dropping) return;
    if (isNaN(bet) || bet <= 0 || bet > balance) {
      notify("Neplatná sázka.", "error");
      return;
    }
    updateBalance(-bet);
    setDropping(true);
    setResult(null);

    let pos = 0;
    const path: number[] = [];
    for (let i = 0; i < PLINKO_ROWS; i++) {
      const dir = Math.random() < 0.5 ? 0 : 1;
      pos += dir;
      path.push(dir);
    }

    let currentStep = 0;
    let currentX = 50;
    setBall({ x: 50, y: 0, opacity: 1 });

    const interval = setInterval(() => {
      if (currentStep >= PLINKO_ROWS) {
        clearInterval(interval);
        setTimeout(() => {
          setBall((b) => (b ? { ...b, y: 105, opacity: 0 } : null));
          setTimeout(() => {
            setBall(null);
            setDropping(false);
            const multi = PLINKO_MULTIS[pos];
            const winAmount = bet * multi;
            if (winAmount > 0) updateBalance(winAmount);
            setResult({ multi });
            if (multi > 1) notify(`Kulička trefila ${multi}x!`, "success");
            processRound("Gravity Drop", bet, winAmount);
          }, 300);
        }, 300);
        return;
      }

      const dir = path[currentStep];
      const nextY = 10 + currentStep * (80 / (PLINKO_ROWS - 1));
      const shift = 5 - currentStep * 0.1;
      currentX += dir === 0 ? -shift : shift;
      setBall({ x: currentX, y: nextY, opacity: 1 });
      currentStep++;
    }, 300);
  };

  return (
    <GameShell
      bet={bet}
      onBetChange={setBet}
      disabled={dropping}
      sideExtra={
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-2 text-center text-sm text-slate-400">
            Riziko: Nízké / Střední
          </div>
          <div className="text-center text-xs text-slate-500">
            8 Řad • 9 Zón násobitelů
          </div>
        </div>
      }
      action={
        <button
          type="button"
          onClick={drop}
          disabled={dropping}
          className="w-full rounded-xl bg-cyan-600 py-4 text-xl font-black text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500 disabled:opacity-50"
        >
          PUSTIT KULIČKU
        </button>
      }
    >
      <div className="relative flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-8">
        {result && (
          <div
            className={`gaming-font absolute top-8 z-20 text-5xl font-black transition-opacity ${
              result.multi >= 1
                ? "text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]"
                : "text-slate-500"
            }`}
          >
            {result.multi}x
          </div>
        )}

        <div className="relative mx-auto aspect-4/3 w-full max-w-[400px]">
          {pegs.map((p, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              style={{ top: `${p.y}%`, left: `${p.x}%` }}
            />
          ))}
          {ball && (
            <div
              className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] transition-all duration-300 linear"
              style={{
                top: `${ball.y}%`,
                left: `${ball.x}%`,
                opacity: ball.opacity,
              }}
            />
          )}
        </div>

        <div className="mt-2 flex h-8 w-full max-w-[400px] justify-between gap-1">
          {PLINKO_MULTIS.map((m, i) => (
            <div
              key={i}
              className={`flex flex-1 items-center justify-center rounded border border-white/10 text-[10px] font-bold text-white shadow-[0_0_5px_rgba(0,0,0,0.5)] sm:text-xs ${BIN_COLORS[i]}`}
            >
              {m}x
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
