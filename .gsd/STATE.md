# STATE.md — Project Memory

> **Aktualizováno**: 2026-05-20
> **Aktuální fáze**: Fáze 5 — RTS Hra & Polish
> **Status**: Active (resumed 2026-05-20)

---

## Kontext

Projekt propoj.app je webový operační systém "Canvas OS" postavený na React + TypeScript + Appwrite.
Fáze 1, Fáze 2, Fáze 3 a Fáze 4 jsou kompletně dokončeny, plně ověřeny a otestovány.

---

## Aktuální pozice

- **Fáze**: 5 — RTS Hra & Polish
- **Status**: Plánování dokončeno (Připraveno ke spuštění)
- **Plány**: 3 prováděcí plány vytvořeny v `.gsd/phases/5/`

## Další krok

1. Spustit `/execute 5` pro zahájení implementace (Nástavbářská RTS hra, animace, lazy loading, Docker a Traefik)

---

## Poslední akce

- [2026-05-19] Fáze 4: Finance & Externí Integrace (Finance, Počasí, Geolokace, E-mail, Bento widgety) kompletně dokončena, typově otestována (tsc pass) a sestavena do produkční verze (build pass)
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
