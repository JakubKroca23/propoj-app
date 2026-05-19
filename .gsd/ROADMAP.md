# ROADMAP.md

> **Aktuální fáze**: Fáze 2: Plugin Systém & App Registry (Dokončeno)
> **Milestone**: v1.0 — Canvas OS MVP

---

## Must-Haves (z SPEC)

- [x] OS shell: launcher, plovoucí okna, command bar, workspaces
- [ ] Appwrite Auth (přihlášení/odhlášení)
- [x] Plugin systém (iframe + manifest)
- [ ] 5 core aplikací funkčních end-to-end
- [ ] Email a počasí integrace
- [x] Dark/light mode
- [ ] Dockerizace

---

## Fáze

### Fáze 1: Základ — OS Shell & Auth
**Status**: ✅ Complete
**Cíl**: Fungující kostra systému — uživatel se přihlásí a vidí Canvas OS launcher s prázdnými sloty
**Požadavky**: REQ-01, REQ-02, REQ-03, REQ-06

**Úkoly:**
- Inicializace Vite + React + TypeScript projektu
- Napojení Appwrite (Auth, konfigurace)
- Login/Logout stránka
- OS Shell layout: Bento Grid Launcher, Taskbar, Workspaces (skeleton)
- Plovoucí okno systém (WindowManager): otevření, zavření, přesun, resize, minimize
- Dark/Light mode systém (CSS variables)
- Global state management (Context / Zustand)

---

### Fáze 2: Plugin Systém & App Registry
**Status**: ✅ Complete
**Cíl**: Fungující plugin engine — lze zaregistrovat, nainstalovat a spustit plugin v sandboxed iframe
**Požadavky**: REQ-07, REQ-08, REQ-09

**Úkoly:**
- Definice manifest.json schématu
- Plugin registry (Appwrite Database)
- Plugin loader (dynamický import + iframe wrapper)
- postMessage komunikační bridge (OS ↔ plugin API)
- Plugin permissions systém (storage, files, calendar, network)
- Správa pluginů v Nastavení (install, uninstall, enable/disable)
- App Launcher: ikony z registru, drag & drop pořadí

---

### Fáze 3: Core Aplikace — Produktivita
**Status**: ⬜ Nezačato
**Cíl**: 4 plně funkční core aplikace: Správce souborů, Poznámky, Úkoly, Kalendář
**Požadavky**: REQ-10, REQ-11, REQ-12, REQ-13, REQ-15

**Úkoly:**
- **Správce souborů**: Appwrite Storage integrace, folder tree, upload/download, preview (obrázky, PDF, video)
- **Poznámky**: Rich-text editor (Tiptap), Appwrite Database, tagy, full-text search
- **Úkoly**: Kanban board + list view, Appwrite Database, priorita, termíny, štítky
- **Kalendář**: měsíční/týdenní/denní view, události v Appwrite, drag & drop přesun
- **PDF Viewer**: inline viewer (pdf.js) jako built-in handler
- Universal Command Bar (`Ctrl+K`): vyhledávání přes všechny aplikace

---

### Fáze 4: Finance & Externí Integrace
**Status**: ⬜ Nezačato
**Cíl**: Finance aplikace + napojení na email a počasí
**Požadavky**: REQ-14, REQ-17, REQ-18

**Úkoly:**
- **Finance**: záznamy příjmů/výdajů, kategorie, měsíční grafy (Chart.js / Recharts)
- **Počasí widget**: OpenWeatherMap API, geolokace, widget na launcher ploše
- **Email**: IMAP konfigurace v nastavení, inbox view, čtení emailů, compose (Appwrite Functions jako proxy)
- Live widgety na ploše: počasí, nadcházející úkoly, poslední soubory, čas/datum

---

### Fáze 5: RTS Hra & Polish
**Status**: ⬜ Nezačato
**Cíl**: RTS hra jako plnohodnotná OS aplikace + finální polish celého systému
**Požadavky**: REQ-16, REQ-19, REQ-20

**Úkoly:**
- **RTS Hra**: Canvas-based mini RTS (jednotky, základna, nepřátelé, fog of war basic)
- Animace a micro-interactions (otevírání oken, přechody, hover efekty)
- Optimalizace výkonu (lazy loading aplikací, code splitting)
- Dockerizace (Dockerfile + docker-compose pro Appwrite + frontend)
- End-to-end testování kritických cest
- README a dokumentace pro self-hosting

---

## Budoucí verze (v2.0+)

- Multi-user podpora, role a oprávnění
- Plugin Marketplace
- OAuth přihlášení (Google, GitHub)
- Mobilní PWA
- Real-time notifikace
- GitHub integrace
- AI asistent (command bar s AI)
