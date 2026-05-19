# DECISIONS.md — Architecture Decision Record

---

## Fáze 1 — Rozhodnutí (2026-05-19)

### Scope
- Nastavení (dark/light přepínač + uživatelský profil) patří do Fáze 1
- Workspaces v Fázi 1: pouze vizuální přepínání bez persistence do Appwrite

### WindowManager
- Zvolena **Varianta A — CSS/DOM based** (absolutně pozicované divy)
- Důvod: iframe pluginy jsou klíčové — canvas render by je znemožnil
- Implementace: `@use-gesture/react` nebo nativní mouse events + ZIndexManager
- Řešení iframe drag-bug: `pointer-events: none` overlay přes iframe při dragu

### State Management
- **Zustand** pro globální stav (WindowManager, workspaces, plugin registry, auth)
- React Context pouze pro theme (dark/light)

### Routing
- Pouze dvě routes: `/login` a `/` (OS shell)
- Bez React Router — jednoduchý podmíněný render podle auth stavu

### Appwrite
- Project ID: `69effdf6003ce697ee83`
- API Endpoint: `https://appwrite.propoj.app/v1`
- Čistý projekt, žádná existující data k migraci

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

---

## Fáze 2 — Rozhodnutí (2026-05-19)

### Scope & Instalace pluginů
- **Instalace**: Kombinace registrace z externích URL a lokálního simulovaného úložiště `/public/plugins/` zapsaných v databázi Appwrite.
- **Perzistence Bento Grid**: Uspořádání kachliček (drag & drop) bude synchronizováno a ukládáno do **Appwrite Database** (kolekce `user_preferences`) pro přihlášeného uživatele.

### Bezpečnost & Izolace (Iframe Sandbox)
- **Rozhodnutí**: Zvolena **Varianta A** — Přísný Iframe Sandbox (`sandbox="allow-scripts"` bez `allow-same-origin`).
- **Důvod**: Maximální izolace pluginů od citlivých tokenů, cookies a localStorage systému Canvas OS.
- **Komunikace**: Výhradně přes `window.postMessage` se striktní validací `event.origin` a typovaným API protokolem (CanvasOS API bridge).

---

## Fáze 3 — Rozhodnutí (2026-05-19)

### 1. Rozsah & Integrace
- **Synchronizace s widgety**: Plovoucí okna aplikací (Kalendář, Úkoly, Počasí) budou přímo synchronizována s widgety na ploše. Změna v aplikaci okamžitě překreslí widget.
- **PDF Prohlížeč**: Bude mít dedikovanou ikonku v launcheru jako samostatná aplikace pro otevření libovolného PDF souboru, ale zároveň se spustí jako automatický handler při kliknutí na `.pdf` soubor ve Správci souborů.
- **Globální vyhledávání (Ctrl+K)**: Zaveden Command Bar vyhledávající napříč všemi entitami (soubory, poznámky, úkoly, události) s možností rychlé filtrace/přepínání okruhu hledání.

### 2. Implementační přístupy aplikací
- **Poznámky (Notes)**: Zvolena **Varianta A** — Plná integrace **Tiptap** rich-text editoru pro moderní WYSIWYG psaní poznámek s ukládáním do HTML/JSON formátu v Appwrite.
- **Správce souborů (Files)**: Zvolena **Varianta B** — Breadcrumbs navigace (cesta složek nahoře, pod tím grid souborů a složek se stylem Google Drive) napojená na Appwrite Storage Bucket `files`.
- **Úkoly (Tasks)**: Zvolena **Varianta B** — Hybridní rozhraní umožňující přepínat zobrazení mezi Kanban deskovým zobrazením a lineárním seznamem s filtry.
- **Kalendář**: Schválen vývoj **plně vlastního, lehkého kalendářového gridu v Reactu (CSS Grid)** bez těžkých externích knihoven, zaručující 100% kontrolu nad skleněným dark/light UX.

### 3. Backend, limity & upload
- Pro správce souborů bude vytvořen nový Storage Bucket s názvem `files` v Appwrite.
- Pro nahrávání velkých souborů implementujeme progress bary s ošetřeným limitem velikosti, aby upload neblokoval UI.
