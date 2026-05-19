# SPEC.md — Project Specification

> **Status**: `FINALIZED`
> **Projekt**: propoj.app — Canvas OS
> **Jazyk**: Čeština (provozní jazyk projektu)

---

## Vize

Propoj.app je osobní webový operační systém — "Canvas OS" — běžící na serveru, který soustřeďuje vše na jedno místo. Uživatel otevře prohlížeč a má k dispozici plnohodnotné pracovní prostředí: správce souborů, poznámky, kalendář, úkoly, finance, nástroje, hry i napojení na externí služby. Díky plugin/app systému lze systém libovolně rozšiřovat novými aplikacemi bez zásahu do jádra.

---

## Cíle

1. **Funkční webový OS** — plovoucí okna, workspaces, command bar, bento launcher, dark/light mode
2. **Plugin systém** — aplikace jako izolované moduly (iframe + manifest), instalovatelné za běhu
3. **Core aplikace** — správce souborů, poznámky, kalendář, úkoly, finance, PDF viewer, RTS hra
4. **Appwrite backend** — autentizace (jméno/heslo), databáze, úložiště souborů, funkce
5. **Externí integrace** — počasí (OpenWeatherMap API), email (IMAP/SMTP)
6. **Škálování** — architektura připravená na více uživatelů a firemní nasazení

---

## Non-Goals (mimo scope v1.0)

- Mobilní aplikace (PWA jako bonus, ne závazek)
- Marketplace pro pluginy třetích stran
- Real-time collaboration (více uživatelů ve stejném dokumentu)
- OAuth přihlášení (Google, GitHub) — v2.0
- Placené plány / billing systém

---

## Uživatelé

**v1.0:** Jeden uživatel (autor), self-hosted instance na vlastním serveru.
**v2.0+:** Firmy, týmy — více uživatelů s rolemi a oprávněními.

---

## Tech Stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend | React + TypeScript (Vite) |
| Styling | Vanilla CSS + CSS Variables (dark/light theming) |
| Backend | Appwrite (Auth, Database, Storage, Functions) |
| Plugin runtime | iframe sandboxing + manifest.json |
| Email | IMAP/SMTP přes Appwrite Functions |
| Počasí | OpenWeatherMap REST API |
| Nasazení | Server (Docker / VPS) |

---

## UI Koncept: Canvas OS

### Hlavní prvky
- **Bento Grid Launcher** — živá plocha s dlaždicemi aplikací a widgety (počasí, nadcházející úkoly, poslední soubory, čas)
- **Floating Panels** — každá aplikace se otevírá jako plovoucí okno (resize, snap, minimize, stack)
- **Universal Command Bar** (`Ctrl+K`) — globální vyhledávání souborů, spouštění aplikací, příkazy
- **Workspaces** — virtuální plochy (Osobní / Práce / Finance / atd.)
- **Taskbar** — spodní lišta s minimalizovanými okny a rychlým přístupem
- **Dark / Light mode** — přepínač v systémových nastaveních, respektuje OS preferenci

### Vizuální styl
- Primárně tmavé téma: deep navy `#0D0F1A` → violet `#6C47FF`
- Světlé téma: off-white `#F5F5F7`, akcent indigo `#4F46E5`
- Glassmorphism pro okna panelů
- Micro-animace pro otevírání/zavírání oken
- Font: Inter (Google Fonts)

---

## Core Aplikace (v1.0)

| Aplikace | Popis |
|----------|-------|
| **Správce souborů** | Browse, upload, download, preview (PDF, obrázky, video), přejmenování, složky |
| **Poznámky** | Rich-text editor, tagy, vyhledávání, Markdown podpora |
| **Kalendář** | Měsíční/týdenní/denní view, události, připomínky |
| **Úkoly** | Kanban board + list view, priorita, termíny, štítky |
| **Finance** | Záznamy příjmů/výdajů, kategorie, grafy, měsíční přehledy |
| **Email** | IMAP inbox, čtení/psaní emailů, složky |
| **Počasí widget** | Aktuální počasí + 5denní předpověď (OpenWeatherMap) |
| **PDF Viewer** | Otevření a prohlížení PDF souborů přímo v systému |
| **Nastavení** | Uživatelský profil, téma, workspaces, správa pluginů |
| **RTS Hra** | Jednoduchá real-time strategy hra v canvasu (jako easter egg / plnohodnotná mini-hra) |

---

## Plugin Systém

Každý plugin je složka obsahující:
```
plugin-name/
  manifest.json   # název, verze, ikona, entrypoint, oprávnění
  index.html      # hlavní UI (spouštěno v sandboxed iframe)
  icon.svg
```

Komunikace plugin ↔ OS přes `postMessage` API.
Plugin může požádat o oprávnění: `storage`, `files`, `calendar`, `network`.

---

## Constraints

- Appwrite jako jediný backend (bez vlastního custom serveru v v1.0)
- Plugin musí fungovat v sandboxed iframe (bezpečnost)
- Offline mode: základní UI se načte, ale data vyžadují server
- Responzivita: primárně desktop (1280px+), tablet jako bonus

---

## Kritéria úspěchu v1.0

- [ ] Přihlášení/odhlášení přes Appwrite Auth
- [ ] OS shell funguje: launcher, plovoucí okna, command bar, workspaces
- [ ] Minimálně 5 core aplikací plně funkčních
- [ ] Plugin systém: lze nainstalovat a spustit externí plugin
- [ ] Email: inbox zobrazí přijaté emaily
- [ ] Počasí widget funguje na launcher ploše
- [ ] Dark/light mode přepínání
- [ ] RTS hra spustitelná jako aplikace
- [ ] Nasaditelné na vlastní server (Docker)
