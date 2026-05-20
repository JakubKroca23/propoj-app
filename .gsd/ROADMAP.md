# ROADMAP.md

> **Aktuální fáze**: Fáze 5: RTS Hra & Polish (Dokončeno)
> **Milestone**: v1.0 — Canvas OS MVP

---

## Must-Haves (z SPEC)

- [x] OS shell: launcher, plovoucí okna, command bar, workspaces
- [x] Appwrite Auth (přihlášení/odhlášení)
- [x] Plugin systém (iframe + manifest)
- [x] 5 core aplikací funkčních end-to-end
- [x] Email a počasí integrace
- [x] Dark/light mode
- [x] Dockerizace

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
**Status**: ✅ Complete
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
**Status**: ✅ Complete
**Cíl**: Finance aplikace + napojení na email a počasí
**Požadavky**: REQ-14, REQ-17, REQ-18

**Úkoly:**
- **Finance**: záznamy příjmů/výdajů, kategorie, měsíční grafy (Chart.js / Recharts)
- **Počasí widget**: OpenWeatherMap API, geolokace, widget na launcher ploše
- **Email**: IMAP konfigurace v nastavení, inbox view, čtení emailů, compose (Appwrite Functions jako proxy)
- Live widgety na ploše: počasí, nadcházející úkoly, poslední soubory, čas/datum

---

### Fáze 5: RTS Hra & Polish
**Status**: ✅ Complete
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

### Fáze 6: Rework základního UI
**Status**: ⬜ Not Started
**Cíl**: Kompletní přepracování základního shellu (Taskbar, Horní lišta, přepínač virtuálních ploch, přihlašovací obrazovka)
**Depends on**: Fáze 5

**Úkoly:**
- Modernizace přihlašovací a registrační obrazovky (nové efekty, plynulé animace)
- Přepracování Taskbaru (ikony otevřených aplikací, indikátor aktivního okna, zobrazení běžících procesů)
- Horní systémová lišta (rychlé přepínače pro Wifi/Network, hlasitost, stav baterie, systémové hodiny s kalendářem)
- Zdokonalený přepínač ploch (Workspace Switcher) s vizuálním náhledem otevřených oken

---

### Fáze 7: Úprava plochy — nové možnosti
**Status**: ⬜ Not Started
**Cíl**: Rozšíření možností Bento Grid plochy o uživatelskou přizpůsobitelnost a nové typy kachliček
**Depends on**: Fáze 6

**Úkoly:**
- Možnost přeskupování (Drag & Drop) kachliček přímo uživatelem na ploše s ukládáním pozic do Appwrite
- Změna velikosti kachliček (1x1, 2x1, 2x2, 4x2) v reálném čase
- Vlastní tapety plochy (vysoce kvalitní Unsplash integrace, možnost nahrát vlastní obrázek, animované gradienty)
- Rychlí zástupci souborů a složek přímo na ploše (desktop icons)

---

### Fáze 8: Rework systému aplikací a widgetů
**Status**: ⬜ Not Started
**Cíl**: Standardizace API pro systémové aplikace a interaktivní Bento widgety na ploše
**Depends on**: Fáze 7

**Úkoly:**
- Sjednocení komunikačního a stavového rozhraní aplikací pro lepší integraci se shellem
- Nový widget engine pro Bento Grid (podpora pro dynamické grafy, mini Kanban widget, počasí s hodinovou předpovědí)
- Systém pro ukládání a obnovení stavu aplikací (Session Restore) po znovunačtení stránky
- Přepracovaný správce procesů (Task Manager) pro sledování paměti a ukončování zamrzlých oken/aplikací

---

### Fáze 9: Rework DESIGNU (Vizuální styl v2.0)
**Status**: ⬜ Not Started
**Cíl**: Přechod na ultra-prémiový vizuální styl (Neo-Glassmorphism s hlubokými 3D vrstvami, dynamickými stíny a fluidními animacemi)
**Depends on**: Fáze 8

**Úkoly:**
- Nový systém designových tokenů (hluboké skleněné efekty s filtrem šumu, dynamická změna sytosti, barevné aury)
- Globální podpora pro barevná témata (Violet, Cyberpunk, Forest, Sakura, Monochrome)
- Integrace moderní sady ikon (např. Lucide React nebo custom SVG ikony přizpůsobené zvoleným tématům)
- Plynulé fyzikální animace oken (vycházející z principů pružnosti/spring physics)

---

### Fáze 10: Polishing & Finální optimalizace
**Status**: ⬜ Not Started
**Cíl**: Dosažení maximální plynulosti (60+ FPS), vyčištění chyb a finální příprava na produkci
**Depends on**: Fáze 9

**Úkoly:**
- Profily výkonu (odstranění zbytečných re-renderů v Reactu, optimalizace překreslování Canvas RTS hry)
- Celosystémové klávesové zkratky a plná bezbariérovost (A11y/keyboard navigation)
- Vyčištění a sjednocení CSS stylů, přechod na čisté utility proměnné
- Kompletní testování kompatibility na mobilních zařízeních, Safari a Firefoxu
- Finální sestavení produkčních kontejnerů s povoleným HTTP/3 a optimálním Brotli/Gzip komprimováním

---

## Budoucí verze (v2.0+)

- Multi-user podpora, role a oprávnění
- Plugin Marketplace
- OAuth přihlášení (Google, GitHub)
- Mobilní PWA
- Real-time notifikace
- GitHub integrace
- AI asistent (command bar s AI)
