# DECISIONS.md — Architecture Decision Record

> Záznamy klíčových architektonických rozhodnutí

---

## ADR-001: Frontend framework — React + TypeScript (Vite)

**Datum**: 2026-05-19
**Status**: Přijato

**Kontext**: Potřebujeme moderní, flexibilní frontend framework pro komplexní OS-like UI.

**Rozhodnutí**: React + TypeScript s Vite buildtoolem.

**Důvody**:
- Nejrozšířenější ekosystém, snadné hledání řešení
- TypeScript zaručí typovou bezpečnost při složité architektuře WindowManageru
- Vite = rychlý dev server, code splitting out-of-box

---

## ADR-002: Plugin systém — iframe sandbox + manifest.json

**Datum**: 2026-05-19
**Status**: Přijato

**Kontext**: Pluginy musí být izolovány (bezpečnost), ale komunikovat s OS.

**Rozhodnutí**: Každý plugin běží v sandboxed `<iframe>`, komunikuje přes `window.postMessage`.

**Důvody**:
- Plná izolace (JS crash pluginu neshodí OS)
- Pluginy mohou být napsány v libovolném frameworku
- Manifest.json definuje oprávnění → security model

---

## ADR-003: Backend — Appwrite

**Datum**: 2026-05-19
**Status**: Přijato

**Kontext**: Potřebujeme auth, databázi, file storage a server functions.

**Rozhodnutí**: Appwrite jako jediný backend v v1.0.

**Důvody**:
- Self-hostovatelný (odpovídá filozofii projektu)
- Pokrývá Auth + DB + Storage + Functions v jednom
- MCP server pro Appwrite je nakonfigurován v projektu
