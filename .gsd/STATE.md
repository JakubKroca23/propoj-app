# STATE.md — Project Memory

> **Aktualizováno**: 2026-05-19
> **Aktuální fáze**: Fáze 1 — Základ (OS Shell & Auth)
> **Status**: ✅ Complete (Ověřeno - 2026-05-19T21:55)

---

## Kontext

Projekt propoj.app je webový operační systém "Canvas OS" postavený na React + TypeScript + Appwrite.
Fáze 1 naplánována (5 plánů, 3 vlny). Připraveno na `/execute 1`.

---

## Aktuální pozice

- **Fáze**: 1 — Základ (OS Shell & Auth)
- **Status**: ✅ Ověřeno (100% hotovo)
- **Plány**: 5 plánů dokončeno a zaneseno

## Další krok

1. Spustit `/plan 2` pro přípravu Fáze 2: Plugin Systém & App Registry

---

## Poslední akce

- [2026-05-19] GSD reinstalován (nejnovější verze)
- [2026-05-19] SPEC.md, REQUIREMENTS.md, ROADMAP.md vytvořeny
- [2026-05-19] .gitignore aktualizován (GSD session files)

---

## Appwrite

- **Project ID**: `69effdf6003ce697ee83`
- **API Endpoint**: `https://appwrite.propoj.app/v1`
- **Stav**: Čistý projekt, žádná existující data

---

## Klíčová rozhodnutí

- **Tech stack**: React + TypeScript (Vite), Appwrite backend
- **Plugin systém**: iframe sandboxing + manifest.json + postMessage API
- **UI koncept**: Canvas OS — bento grid launcher, floating panels, command bar
- **Téma**: Dark/light mode (CSS variables), primární barvy navy/violet
- **Auth**: Appwrite jméno/heslo (OAuth v v2.0)
- **Hra**: RTS strategie (Canvas API) jako Fáze 5

---

## Blokery

Žádné aktuální blokery.

---

## Poznámky pro příští session

- Fáze 1 je kompletně hotová a typově bezpečná.
- Fáze 2 přinese postMessage bridge, sandboxed iframe pluginy a registr v Appwrite databázi.
