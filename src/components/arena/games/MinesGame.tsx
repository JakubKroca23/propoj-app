"use client";

import { useState } from "react";
import { Bomb, Gem } from "lucide-react";
import { GameShell } from "../GameShell";
import { useArenaStore } from "@/stores/arenaStore";
import { calculateMinesMulti } from "@/lib/games";

export function MinesGame() {
  const balance = useArenaStore((s) => s.balance);
  const updateBalance = useArenaStore((s) => s.updateBalance);
  const notify = useArenaStore((s) => s.notify);
  const processRound = useArenaStore((s) => s.processRound);

  const [bet, setBet] = useState(100);
  const [minesCount, setMinesCount] = useState(3);
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [hits, setHits] = useState(0);
  const [multi, setMulti] = useState(1);
  const [overlay, setOverlay] = useState<{ text: string; win: boolean } | null>(null);
  const [betLocked, setBetLocked] = useState(100);

  const start = () => {
    if (running) return;
    if (
      isNaN(bet) ||
      bet <= 0 ||
      bet > balance ||
      minesCount < 1 ||
      minesCount > 24
    ) {
      notify("Neplatné zadání.", "error");
      return;
    }
    updateBalance(-bet);
    setBetLocked(bet);
    setRunning(true);
    setFinished(false);
    setHits(0);
    setMulti(1);
    setRevealed(new Set());
    setOverlay(null);

    const mines = Array(25).fill(false);
    let placed = 0;
    while (placed < minesCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!mines[idx]) {
        mines[idx] = true;
        placed++;
      }
    }
    setGrid(mines);
  };

  const end = (cashedOut: boolean, currentHits: number, currentMulti: number) => {
    setRunning(false);
    setFinished(true);
    setRevealed(new Set(Array.from({ length: 25 }, (_, i) => i)));

    let userWinAmount = 0;
    if (cashedOut) {
      userWinAmount = betLocked * currentMulti;
      updateBalance(userWinAmount);
      setOverlay({ text: `+${userWinAmount.toFixed(2)}`, win: true });
      notify(`Zisk ${userWinAmount.toFixed(2)} 🪙`, "success");
    } else {
      setOverlay({ text: "BUM!", win: false });
      notify("Šlápl jsi na toxický odpad.", "error");
    }
    processRound("Toxic Vault", betLocked, userWinAmount);
    void currentHits;
  };

  const reveal = (index: number) => {
    if (!running || revealed.has(index)) return;
    const next = new Set(revealed);
    next.add(index);
    setRevealed(next);

    if (grid[index]) {
      end(false, hits, multi);
      return;
    }

    const newHits = hits + 1;
    const newMulti = calculateMinesMulti(minesCount, newHits);
    setHits(newHits);
    setMulti(newMulti);

    if (newHits === 25 - minesCount) {
      end(true, newHits, newMulti);
    }
  };

  const cashout = () => {
    if (running && hits > 0) end(true, hits, multi);
  };

  return (
    <GameShell
      bet={bet}
      onBetChange={setBet}
      disabled={running}
      sideExtra={
        <>
          <h3 className="mb-2 font-bold">Počet min (1-24)</h3>
          <div className="mb-6 flex items-center rounded-lg border border-slate-700 bg-slate-900 p-3">
            <input
              type="number"
              min={1}
              max={24}
              value={minesCount}
              disabled={running}
              onChange={(e) => setMinesCount(parseInt(e.target.value) || 1)}
              className="w-full bg-transparent text-xl font-bold text-white outline-none"
            />
            <Bomb className="ml-2 h-4 w-4 text-red-500" />
          </div>
        </>
      }
      action={
        running ? (
          <button
            type="button"
            onClick={cashout}
            disabled={hits === 0}
            className="w-full rounded-xl bg-green-500 py-4 text-lg font-black text-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-green-400 disabled:opacity-50"
          >
            Vybrat ({multi.toFixed(2)}x) = {(betLocked * multi).toFixed(2)}
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="w-full rounded-xl bg-red-500 py-4 text-xl font-black text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-400"
          >
            VSADIT
          </button>
        )
      }
    >
      <div className="relative flex flex-1 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-8">
        <div className="grid aspect-square w-full max-w-md grid-cols-5 gap-2 md:gap-3">
          {Array.from({ length: 25 }, (_, i) => {
            const isRevealed = revealed.has(i);
            const isMine = grid[i];
            let content: React.ReactNode = null;
            let cls =
              "aspect-square rounded-lg flex items-center justify-center text-3xl transition-colors border";

            if (!running && !finished) {
              cls +=
                " bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]";
            } else if (!isRevealed) {
              cls +=
                " bg-slate-700 hover:bg-slate-600 border-slate-600 cursor-pointer hover:-translate-y-1 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]";
            } else if (isMine) {
              cls += finished && !running
                ? " bg-red-500/30 border-red-500"
                : " bg-red-500/30 border-red-500";
              content = (
                <Bomb
                  className={`h-8 w-8 ${finished && revealed.size === 25 ? "text-red-500/40" : "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`}
                />
              );
            } else {
              cls += " bg-green-500/20 border-green-500";
              content = (
                <Gem
                  className={`h-8 w-8 ${finished && revealed.size === 25 && !running ? "text-green-500/40" : "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"}`}
                />
              );
            }

            return (
              <button
                key={i}
                type="button"
                disabled={!running || isRevealed}
                onClick={() => reveal(i)}
                className={cls}
              >
                {content}
              </button>
            );
          })}
        </div>
        {overlay && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-900/80 backdrop-blur-sm">
            <div
              className={`gaming-font font-black ${
                overlay.win
                  ? "text-5xl text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                  : "text-6xl text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              }`}
            >
              {overlay.text}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
