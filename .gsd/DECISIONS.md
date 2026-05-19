# DECISIONS.md — ProPoj

> ADR log — Architektonická rozhodnutí

---

## ADR-001: Frontend framework
**Datum**: 2026-05-19
**Rozhodnutí**: React 18 + TypeScript + Vite
**Důvod**: Robustní ekosystém, typová bezpečnost, rychlý HMR, nejlepší podpora pro Konva.js a Three.js

## ADR-002: Backend
**Datum**: 2026-05-19
**Rozhodnutí**: Appwrite (self-hosted)
**Důvod**: MCP server nakonfigurován, pokrývá auth + databáze + storage + functions, GDPR-friendly self-hosting

## ADR-003: 2D vizualizace
**Datum**: 2026-05-19
**Rozhodnutí**: Konva.js + React-Konva
**Důvod**: Výkonný canvas, drag & drop, transformace, přijatelná křivka učení, dobrá dokumentace

## ADR-004: 3D vizualizace
**Datum**: 2026-05-19
**Rozhodnutí**: Three.js + React Three Fiber — odloženo na v2.0
**Důvod**: MVP priorita je 2D konfigurátor, 3D přidáme až bude stabilní základ

## ADR-005: UI komponenty
**Datum**: 2026-05-19
**Rozhodnutí**: shadcn/ui + Radix UI + Tailwind CSS
**Důvod**: Plně customizovatelné, přístupné, žádný lock-in, professionální vzhled

## ADR-006: State management
**Datum**: 2026-05-19
**Rozhodnutí**: Zustand (lokální) + TanStack Query (server state)
**Důvod**: Lightweight, bez boilerplate, dobře škáluje pro komplexní aplikaci

## ADR-007: Jazyk aplikace
**Datum**: 2026-05-19
**Rozhodnutí**: Čeština jako primární jazyk UI
**Důvod**: Interní aplikace pro český tým, odborné termíny jsou v češtině
