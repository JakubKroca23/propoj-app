"use client";

import { useEffect } from "react";
import { useArenaStore } from "@/stores/arenaStore";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Lobby } from "./Lobby";
import { LiveFeed } from "./LiveFeed";
import { Notifications } from "./Notifications";
import { RoundSummary } from "./RoundSummary";
import { CrashGame } from "./games/CrashGame";
import { MinesGame } from "./games/MinesGame";
import { DiceGame } from "./games/DiceGame";
import { SlotGame } from "./games/SlotGame";
import { PlinkoGame } from "./games/PlinkoGame";

export function ArenaShell() {
  const view = useArenaStore((s) => s.view);
  const ready = useArenaStore((s) => s.ready);
  const init = useArenaStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="font-mono text-sm tracking-widest uppercase">
            Načítám arénu…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white select-none">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col overflow-y-auto">
          {view === "lobby" && <Lobby />}
          {view === "crash" && <CrashGame />}
          {view === "mines" && <MinesGame />}
          {view === "dice" && <DiceGame />}
          {view === "slot" && <SlotGame />}
          {view === "plinko" && <PlinkoGame />}
        </div>
        <LiveFeed />
      </main>
      <Footer />
      <Notifications />
      <RoundSummary />
    </div>
  );
}
