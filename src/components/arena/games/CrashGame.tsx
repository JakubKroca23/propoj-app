"use client";

import { useEffect, useRef, useState } from "react";
import { Rocket } from "lucide-react";
import { GameShell } from "../GameShell";
import { useArenaStore } from "@/stores/arenaStore";
import { generateCrashPoint } from "@/lib/games";

export function CrashGame() {
  const balance = useArenaStore((s) => s.balance);
  const updateBalance = useArenaStore((s) => s.updateBalance);
  const notify = useArenaStore((s) => s.notify);
  const processRound = useArenaStore((s) => s.processRound);

  const [bet, setBet] = useState(100);
  const [state, setState] = useState<"stopped" | "running" | "crashed">("stopped");
  const [multi, setMulti] = useState(1);
  const [status, setStatus] = useState("");
  const [statusClass, setStatusClass] = useState("");
  const [multiClass, setMultiClass] = useState("text-slate-300");
  const [rocketY, setRocketY] = useState(0);
  const [rocketRot, setRocketRot] = useState(0);
  const [rocketOpacity, setRocketOpacity] = useState(0);

  const crashPointRef = useRef(1);
  const betRef = useRef(100);
  const multiRef = useRef(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const endCrash = (cashedOut: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState("crashed");
    setRocketOpacity(0);

    let userWinAmount = 0;
    if (cashedOut) {
      userWinAmount = betRef.current * multiRef.current;
      updateBalance(userWinAmount);
      setStatus("Vybráno!");
      setStatusClass("text-green-500 font-bold tracking-widest uppercase");
      setMultiClass("text-green-500 neon-green");
      notify(`Vyhráváš ${userWinAmount.toFixed(2)} 🪙`, "success");
    } else {
      setMulti(crashPointRef.current);
      setStatus("Havárie!");
      setStatusClass("text-red-500 font-bold tracking-widest uppercase");
      setMultiClass("text-red-500 neon-red");
      notify("Raketa havarovala.", "error");
    }
    processRound("Space Rush", betRef.current, userWinAmount, crashPointRef.current);
  };

  const start = () => {
    if (state === "running") return;
    if (isNaN(bet) || bet <= 0 || bet > balance) {
      notify("Neplatná sázka.", "error");
      return;
    }
    updateBalance(-bet);
    betRef.current = bet;
    crashPointRef.current = generateCrashPoint();
    multiRef.current = 1;
    setMulti(1);
    setState("running");
    setStatus("Raketa letí...");
    setStatusClass("text-blue-400 font-bold tracking-widest uppercase animate-pulse");
    setMultiClass("text-white");
    setRocketOpacity(1);
    setRocketY(0);
    setRocketRot(0);

    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick += 50;
      const m = Math.pow(1.001, tick / 10);
      multiRef.current = m;
      if (m >= crashPointRef.current) {
        endCrash(false);
      } else {
        setMulti(m);
        setRocketY(Math.min(100, (m - 1) * 30));
        setRocketRot(Math.min(45, (m - 1) * 10));
      }
    }, 50);
  };

  return (
    <GameShell
      bet={bet}
      onBetChange={setBet}
      disabled={state === "running"}
      action={
        state === "running" ? (
          <button
            type="button"
            onClick={() => endCrash(true)}
            className="w-full rounded-xl bg-green-500 py-4 text-xl font-black text-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-green-400"
          >
            VYBRAT
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="w-full rounded-xl bg-blue-600 py-4 text-xl font-black text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500"
          >
            ODSTARTOVAT
          </button>
        )
      }
    >
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.2),#0f172a,#0f172a)]" />
        <div className={`absolute top-8 ${statusClass}`}>{status}</div>
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <div
            className={`gaming-font text-6xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors ${multiClass}`}
          >
            {multi.toFixed(2)}x
          </div>
          <div className="mt-4 flex h-32 items-end justify-center overflow-visible">
            <Rocket
              className="h-16 w-16 text-slate-400 transition-transform duration-75"
              style={{
                opacity: rocketOpacity,
                transform: `translateY(-${rocketY}px) rotate(${rocketRot}deg)`,
              }}
            />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
