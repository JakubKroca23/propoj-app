"use client";

import { useState } from "react";
import { GameShell } from "../GameShell";
import { useArenaStore } from "@/stores/arenaStore";
import { getDiceMulti } from "@/lib/games";

export function DiceGame() {
  const balance = useArenaStore((s) => s.balance);
  const updateBalance = useArenaStore((s) => s.updateBalance);
  const notify = useArenaStore((s) => s.notify);
  const processRound = useArenaStore((s) => s.processRound);

  const [bet, setBet] = useState(100);
  const [chance, setChance] = useState(50);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState("00.00");
  const [resultClass, setResultClass] = useState("text-white");
  const [winStatus, setWinStatus] = useState<{
    text: string;
    cls: string;
  } | null>(null);

  const multi = getDiceMulti(chance);
  const potential = bet * multi;

  const roll = () => {
    if (rolling) return;
    if (isNaN(bet) || bet <= 0 || bet > balance) {
      notify("Neplatná sázka.", "error");
      return;
    }
    updateBalance(-bet);
    setRolling(true);
    setWinStatus(null);
    setResultClass("text-white");

    let rolls = 0;
    const anim = setInterval(() => {
      setResult((Math.random() * 100).toFixed(2));
      rolls++;
      if (rolls > 15) {
        clearInterval(anim);
        const final = Math.random() * 100;
        const isWin = final < chance;
        const m = getDiceMulti(chance);
        setResult(final.toFixed(2));
        setRolling(false);

        let userWinAmount = 0;
        if (isWin) {
          userWinAmount = bet * m;
          updateBalance(userWinAmount);
          setResultClass("text-green-400 neon-green");
          setWinStatus({
            text: "VÝHRA",
            cls: "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]",
          });
          notify(`Vyhráváš ${userWinAmount.toFixed(2)} 🪙`, "success");
        } else {
          setResultClass("text-red-500 neon-red");
          setWinStatus({
            text: "PROHRA",
            cls: "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]",
          });
        }
        processRound("Neon Slip", bet, userWinAmount);
      }
    }, 40);
  };

  return (
    <GameShell
      bet={bet}
      onBetChange={setBet}
      disabled={rolling}
      sideExtra={
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-1 flex justify-between text-sm text-slate-400">
            <span>Šance:</span>
            <span className="font-bold text-white">{chance}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={95}
            value={chance}
            disabled={rolling}
            onChange={(e) => setChance(parseInt(e.target.value))}
            className="dice-range mb-4 mt-2 w-full"
          />
          <div className="mb-1 flex justify-between text-sm text-slate-400">
            <span>Násobitel:</span>
            <span className="font-bold text-white">{multi.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Možná výhra:</span>
            <span className="font-bold text-white">{potential.toFixed(2)}</span>
          </div>
        </div>
      }
      action={
        <button
          type="button"
          onClick={roll}
          disabled={rolling}
          className="w-full rounded-xl bg-violet-600 py-4 text-xl font-black text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          HODIT KOSTKOU
        </button>
      }
    >
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.2),#0f172a,#0f172a)]" />
        {winStatus && (
          <div
            className={`gaming-font absolute top-4 right-4 text-2xl font-black ${winStatus.cls}`}
          >
            {winStatus.text}
          </div>
        )}
        <div className="z-10 text-center">
          <div className="mb-4 text-sm tracking-widest text-slate-400 uppercase">
            Výsledek hodu (0 - 100)
          </div>
          <div
            className={`gaming-font text-7xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-colors duration-300 ${resultClass}`}
          >
            {result}
          </div>
          <div className="mt-8 text-sm text-slate-500">
            Cíl: hodit méně než tvá zvolená šance
          </div>
        </div>
      </div>
    </GameShell>
  );
}
