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

---

## Fáze 4 — Rozhodnutí (2026-05-19)

### 1. Rozsah & Integrace
- **Bento Widgety**: Plná integrace a oživení Bento Grid launcheru:
  - **Hodiny a datum**: Digitální hodiny s live vteřinovým překreslováním.
  - **Počasí widget**: Aktuální teplota a ikona z Open-Meteo API s proklikem do Weather aplikace.
  - **Nadcházející úkoly**: Rychlý checklist nevyřízených úkolů synchronizovaný se Zustand storem Tasks.
  - **Poslední soubory**: Seznam 3-4 posledních nahraných souborů ve FileManageru.
  - **Budget Widget**: Rychlý vizuální bar znázorňující poměr příjmů a výdajů.

### 2. Implementační přístupy aplikací
- **Finance (REQ-14)**: Zvolena **Varianta A** — Záznam příjmů/výdajů s kategoriemi a vlastním renderingem grafů pomocí responsivních **React-SVG elementů** bez externích knihoven, zaručující 100% kontrolu nad glassmorphic dark/light tématem.
- **Email (REQ-17)**: Zvolena **Varianta A** — Reálná IMAP/SMTP klientská integrace. Uživatel si v Nastavení OS (Nastavení -> Účty a Integrace) zadá své IMAP a SMTP přihlašovací údaje (host, port, username, password). Systém s nimi bude komunikovat přes zabezpečenou Appwrite serverless Node.js funkci (TCP proxy socket).
- **Počasí (REQ-18)**: Dohodnuto použití bezplatného a veřejného **Open-Meteo API** (`open-meteo.com`), které nevyžaduje žádnou registraci ani API klíče. Geolokace se získá přes `navigator.geolocation` v prohlížeči, s plynulým fallbackem na Prahu v případě offline/zamítnutí práv.

---

## Fáze 5 — Rozhodnutí (2026-05-19)

### 1. Nástavbářská RTS Hra (REQ-16)
- **Téma**: Odlehčený Warcraft 2 styl zasazený do prostředí nástavbářské/utilitní strojírenské firmy (výroba speciálních nástaveb na nákladní podvozky).
- **Jednotky**:
  - **Šasi (Worker)**: Základní podvozek na kolech. Sbírá ocel ze Šrotiště a dováží ji do Hlavní dílny.
  - **Jeřábový vůz (Builder)**: Stavební vozidlo s ramenem jeřábu. Staví a opravuje budovy na mapě.
  - **Čelní nakladač (Melee Fighter)**: Bojová jednotka s radlicí/lžící na boj zblízka.
  - **Hasičská plošina (Ranged Fighter)**: Bojový vůz s dálkovým vodním dělem pro střelbu na dálku.
  - **Konkurenční sabotéři (Nepřátelé)**: Černá auta s porouchaným kouřem vysílaná konkurencí na sabotáž základny.
- **Budovy & Mechaniky**:
  - **Hlavní dílna (HQ)**: Výroba Šasi a Jeřábů, odevzdávání surovin.
  - **Montážní hala (Assembly)**: Výroba bojových nástaveb (Nakladače, Hasičské plošiny).
  - **Sklad součástek (Depot)**: Zvyšuje kapacitu strojového parku (limit jednotek).
  - **Automatický důl (Steel Mine)**: Důl na ocel s automatickou těžbou na grid mřížce.
- **Ukládání skóre**: Výsledné skóre hry a statistiky (vyrobené jednotky, přežité vlny) se po skončení hry ukládají do Appwrite databáze pod kolekci `game_highscores`.

### 2. Animace a Optimalizace výkonu
- **Animace**: Zvolena **Varianta A** — čisté a vysoce výkonné CSS keyframes a transitions, které udrží minimální velikost výsledného bundle bez závislosti na Framer Motion.
- **Optimalizace výkonu**: Zavedení asynchronního **Lazy Loading & Code Splitting** pomocí `React.lazy()` a `Suspense` pro všechny core aplikace (včetně RTS hry), čímž dojde k výraznému snížení počátečního stahovaného balíku frontend kódu v prohlížeči.

### 3. Dockerizace & Traefik Síť (REQ-20)
- **Docker**: Vytvořit produkční `Dockerfile` založený na Nginx SPA konfiguraci.
- **Síťování**: `docker-compose.yml` bude nastaven tak, aby frontend kontejner běžel za reverzní proxy Traefik na subdoméně `propoj.app`, přičemž komunikace s Appwrite serverem bude probíhat v rámci interní docker sítě.


---

## Fáze 6 — Rozhodnutí (2026-05-20)

### Přihlašovací obrazovka (Login)
- **Rozhodnutí**: Kombinace obou variant. Pozadí bude tvořeno vysoce kvalitní tapetou s fluidním gridem a pomalu plovoucími animovanými neonovými sférami. V popředí bude zobrazen elegantní čas a datum evokující zamykací obrazovku (Lock Screen). Plynulým gestem/kliknutím dojde k přechodu na skleněnou (glassmorphic) kartu přihlášení a registrace.

### Taskbar a plocha (Dock)
- **Rozhodnutí**: Kompletní rework Taskbaru na plovoucí dok (floating Dock) centrovaný uprostřed dole (styl macOS Dock). Bude menší, elegantnější a bude se vznášet nad dolním okrajem obrazovky s jemným rozostřením pozadí (backdrop-filter) a zářící linkou.
- **Správa procesů**: Dock bude integrovat zástupce aplikací s aktivními vizuálními indikátory (tečka pod ikonou pro běžící proces, jasná svítící tečka pro aktivně zaostřenou instanci, a snížená průhlednost pro minimalizovaná okna).

### Horní lišta & Virtuální plochy
- **Rozhodnutí**: Horní systémová lišta (Top Bar) byla zamítnuta pro zachování čistoty a maximální plochy obrazovky.
- **Rozhodnutí**: Přepínač virtuálních ploch (Workspace Switcher) byl zamítnut a bude zcela odstraněn/skryt, aby se rozhraní zjednodušilo a soustředilo se na přímou práci s okny na jediné ploše.
