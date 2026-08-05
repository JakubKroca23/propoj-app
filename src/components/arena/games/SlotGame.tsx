"use client";

import { useEffect, useState } from "react";
import { GameShell } from "../GameShell";
import { useArenaStore } from "@/stores/arenaStore";
import { SLOT_SYMBOLS, rollSlotOutcome, type SlotSymbol } from "@/lib/games";

const SYMBOL_H = 64;

export function SlotGame() {
  const balance = useArenaStore((s) => s.balance);
  const updateBalance = useArenaStore((s) => s.updateBalance);
  const notify = useArenaStore((s) => s.notify);
  const processRound = useArenaStore((s) => s.processRound);

  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>(() =>
    Array.from({ length: 4 }, () =>
      Array.from(
        { length: 3 },
        () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ),
    ),
  );
  const [offsets, setOffsets] = useState([0, 0, 0, 0]);
  const [animating, setAnimating] = useState(false);
  const [winOverlay, setWinOverlay] = useState<{ amount: number; big: boolean } | null>(null);
  const [winSym, setWinSym] = useState<SlotSymbol | null>(null);

  useEffect(() => {
    // reset transition after spin settles
  }, []);

  const spin = () => {
    if (spinning) return;
    if (isNaN(bet) || bet <= 0 || bet > balance) {
      notify("Neplatná sázka.", "error");
      return;
    }
    updateBalance(-bet);
    setSpinning(true);
    setWinOverlay(null);
    setWinSym(null);

    const { winMulti, winSym: sym } = rollSlotOutcome();
    const newReels: string[][] = [];

    for (let i = 0; i < 4; i++) {
      const strip: string[] = [];
      for (let j = 0; j < 20; j++) {
        strip.push(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
      }
      const final3 = [
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ];
      if (sym) {
        final3[Math.floor(Math.random() * 3)] = sym;
      } else if (i === 3) {
        final3[0] = final3[1] = final3[2] = "🍒";
      }
      strip.push(...final3);
      newReels.push(strip);
    }

    setReels(newReels);
    setAnimating(false);
    setOffsets([0, 0, 0, 0]);

    requestAnimationFrame(() => {
      setAnimating(true);
      setOffsets(
        newReels.map((strip) => (strip.length - 3) * SYMBOL_H),
      );
    });

    setTimeout(() => {
      setSpinning(false);
      const winAmount = bet * winMulti;
      if (winAmount > 0) {
        updateBalance(winAmount);
        setWinSym(sym);
        setWinOverlay({ amount: winAmount, big: winMulti >= 10 });
        notify(`Super trefa! Vyhráváš ${winAmount.toFixed(2)} 🪙`, "success");
      }
      processRound("Neon 81", bet, winAmount);
    }, 2300);
  };

  return (
    <GameShell
      bet={bet}
      onBetChange={setBet}
      disabled={spinning}
      sideExtra={
        <div className="mb-6 flex-1 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
          <h4 className="mb-3 text-center font-mono text-xs font-bold tracking-wider text-pink-400 uppercase">
            Výplatní tabulka
          </h4>
          {(
            [
              ["💎", "14.0x"],
              ["🔔", "10.0x"],
              ["🍇", "5.0x"],
              ["🍋", "2.0x"],
              ["🍒", "1.0x"],
            ] as const
          ).map(([sym, pay], i) => (
            <div
              key={sym}
              className={`mb-1 flex items-center justify-between rounded p-1.5 ${i % 2 === 0 ? "bg-slate-800/50" : ""}`}
            >
              <span className="text-xl">{sym}</span>
              <span className="font-bold text-white">{pay}</span>
            </div>
          ))}
        </div>
      }
      action={
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="w-full rounded-xl bg-pink-600 py-4 text-xl font-black text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:bg-pink-500 disabled:opacity-50"
        >
          ZATOČIT
        </button>
      }
    >
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(131,24,67,0.1),#0f172a,#0f172a)]" />
        <div className="relative z-10 rounded-2xl border-4 border-slate-700 bg-slate-800 p-4 shadow-[0_0_30px_rgba(236,72,153,0.1)] md:p-6">
          {winOverlay && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-slate-900/90 backdrop-blur-sm">
              <div
                className={`gaming-font text-5xl font-black drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] ${
                  winOverlay.big ? "animate-pulse text-pink-400" : "text-white"
                }`}
              >
                VÝHRA!
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-yellow-400">
                +{winOverlay.amount.toFixed(2)}
              </div>
            </div>
          )}
          <div className="relative flex gap-2 overflow-hidden rounded-lg border-2 border-slate-950 bg-slate-900 p-3 md:gap-3">
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-around py-[30px]">
              <div className="h-px w-full bg-white/10" />
              <div className="h-px w-full bg-white/10" />
            </div>
            {reels.map((strip, i) => (
              <div
                key={i}
                className="slot-reel-container h-48 w-16 overflow-hidden rounded bg-slate-950 shadow-inner md:w-20"
              >
                <div
                  className="flex flex-col"
                  style={{
                    transform: `translateY(-${offsets[i]}px)`,
                    transition: animating
                      ? `transform ${1.5 + i * 0.2}s cubic-bezier(0.1, 1.1, 0.2, 1)`
                      : "none",
                  }}
                >
                  {strip.map((sym, si) => (
                    <div
                      key={si}
                      className={`flex h-16 items-center justify-center text-4xl text-shadow-sm ${
                        winSym &&
                        sym === winSym &&
                        si >= strip.length - 3
                          ? "winning-line"
                          : ""
                      }`}
                    >
                      {sym}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="z-10 mt-8 px-4 text-center font-mono text-xs tracking-widest text-slate-500 md:text-sm">
          81 LINIÍ • CRISS CROSS • KDEKOLIV
        </div>
      </div>
    </GameShell>
  );
}
