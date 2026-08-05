"use client";

import { Check, Info, X } from "lucide-react";
import { useArenaStore } from "@/stores/arenaStore";

export function Notifications() {
  const notifications = useArenaStore((s) => s.notifications);

  return (
    <div className="pointer-events-none absolute top-20 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => {
        const color =
          n.type === "success"
            ? "bg-green-600"
            : n.type === "error"
              ? "bg-red-600"
              : "bg-blue-600";
        const Icon =
          n.type === "success" ? Check : n.type === "error" ? X : Info;
        return (
          <div
            key={n.id}
            className={`${color} flex items-center gap-3 rounded-lg border border-white/20 px-4 py-3 font-bold text-white shadow-lg animate-in slide-in-from-right`}
          >
            <Icon className="h-4 w-4" />
            {n.message}
          </div>
        );
      })}
    </div>
  );
}
