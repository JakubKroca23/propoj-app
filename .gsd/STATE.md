# STATE.md — Project Memory

> **Aktualizováno**: 2026-05-19
> **Aktuální fáze**: Fáze 4 — Finance & Externí Integrace
> **Status**: ⬜ Nezačato (Aktivní)

---

## Kontext

Projekt propoj.app je webový operační systém "Canvas OS" postavený na React + TypeScript + Appwrite.
Fáze 1, Fáze 2 a Fáze 3 jsou kompletně dokončeny, plně ověřeny a otestovány.

---

## Aktuální pozice

- **Fáze**: 4 — Finance & Externí Integrace
- **Status**: Plánování dokončeno
- **Plány**: Vytvořeny a ověřeny plány 4.1, 4.2 a 4.3

## Další krok

1. Spustit `/execute 4` pro realizaci Fáze 4 (Finance, Počasí, Geolokace, E-mail a Bento Grid widgety)

---

## Poslední akce

- [2026-05-19] Fáze 2: Plugin Systém & App Registry kompletně dokončena, typově otestována (npx tsc --noEmit pass) a zkompilována (npm run build pass)
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

- Fáze 2 je kompletně naplánována do 3 detailních plánů.
- Připraveno ke spuštění přes `/execute 2`.
