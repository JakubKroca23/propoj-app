"use client";

import {
  Rocket,
  Gem,
  Dices,
  Crown,
  Network,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { useArenaStore } from "@/stores/arenaStore";
import type { ViewId } from "@/lib/games";

const GAMES: {
  id: ViewId;
  title: string;
  desc: string;
  accent: string;
  hoverBorder: string;
  hoverShadow: string;
  btnHover: string;
  Icon: LucideIcon;
}[] = [
  {
    id: "crash",
    title: "🚀 SPACE RUSH",
    desc: "Svez se na vlně rostoucího násobitele. Vyskoč dřív, než to celé buchne! Brutální adrenalin.",
    accent: "text-yellow-400",
    hoverBorder: "hover:border-yellow-500",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]",
    btnHover: "group-hover:bg-yellow-500 group-hover:text-slate-900",
    Icon: Rocket,
  },
  {
    id: "mines",
    title: "💎 TOXIC VAULT",
    desc: "Otevírej trezory. Najdi diamanty, ale vyhni se toxickému odpadu. Víc diamantů = extrémní zisk!",
    accent: "text-red-400",
    hoverBorder: "hover:border-red-500",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]",
    btnHover: "group-hover:bg-red-500 group-hover:text-white",
    Icon: Gem,
  },
  {
    id: "dice",
    title: "🎲 NEON SLIP",
    desc: "Čistá pravděpodobnost. Nastav si hranici a doufej, že padneš pod ni. Riskuj víc pro maximální profit.",
    accent: "text-violet-400",
    hoverBorder: "hover:border-violet-500",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    btnHover: "group-hover:bg-violet-500 group-hover:text-white",
    Icon: Dices,
  },
  {
    id: "slot",
    title: "🎰 NEON 81",
    desc: "Tradiční 4-válcový automat s 81 výherními liniemi. Tref stejné symboly kdekoli pro obří násobitele!",
    accent: "text-pink-400",
    hoverBorder: "hover:border-pink-500",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    btnHover: "group-hover:bg-pink-500 group-hover:text-white",
    Icon: Crown,
  },
  {
    id: "plinko",
    title: "🔮 GRAVITY DROP",
    desc: "Pusť kuličku do pyramidy překážek. Dokážeš zasáhnout okrajové zóny s extrémními bonusy?",
    accent: "text-cyan-400",
    hoverBorder: "hover:border-cyan-500",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
    btnHover: "group-hover:bg-cyan-500 group-hover:text-white",
    Icon: Network,
  },
];

export function Lobby() {
  const setView = useArenaStore((s) => s.setView);

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-slate-200">
        <Flame className="h-8 w-8 text-orange-500" /> Vyber si hru
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setView(g.id)}
            className={`group cursor-pointer overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 text-left transition-all ${g.hoverBorder} ${g.hoverShadow}`}
          >
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
              <g.Icon className="h-16 w-16 text-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:text-inherit" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#334155_1px,transparent_0)] bg-size-[20px_20px] opacity-50" />
            </div>
            <div className="p-5">
              <h3 className={`gaming-font mb-2 text-xl ${g.accent}`}>{g.title}</h3>
              <p className="mb-4 text-sm text-slate-400">{g.desc}</p>
              <span
                className={`block w-full rounded-lg bg-slate-700 py-2 text-center font-bold text-white transition-colors ${g.btnHover}`}
              >
                Hrát
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
