# ROADMAP.md — ProPoj

> **Aktuální fáze**: Nezahájeno
> **Milestone**: v1.0 — MVP Konfigurátor
> **Aktualizováno**: 2026-05-19

---

## Must-Haves (v1.0)

- [ ] Autentizace a role uživatelů
- [ ] Databáze podvozků, nástaveb a příslušenství (CRUD)
- [ ] Vizuální 2D konfigurátor (bokorys)
- [ ] Výpočet zatížení náprav a těžiště
- [ ] Základní stabilita jeřábu
- [ ] Právní checklist (klíčové vyhlášky)
- [ ] Generování PDF protokolu

---

## Fáze

### Fáze 1: Základy projektu & Auth
**Status**: ⬜ Nezahájeno
**Cíl**: Funkční projekt s autentizací, rolemi a základní navigací

**Úkoly**:
- Inicializace Vite + React + TypeScript projektu
- Nastavení Appwrite (auth, databáze, storage)
- Implementace přihlášení / odhlášení
- Role-based access control (Admin, Konstruktér, Obchodník, Technik)
- Základní layout aplikace (sidebar, navigace, header)
- Design systém (shadcn/ui + Tailwind, barvy, typografie)

---

### Fáze 2: Databáze Komponent
**Status**: ⬜ Nezahájeno
**Cíl**: Plně funkční katalog vozidel, nástaveb a příslušenství

**Úkoly**:
- Datový model: podvozky, nástavby, příslušenství (Appwrite collections)
- Admin rozhraní pro CRUD komponent
- Atributy: rozměry, hmotnosti, nosnosti, kompatibilita, obrázky
- Vyhledávání, filtrování, kategorizace
- Import z CSV (seed dat)
- Zobrazení katalogu pro uživatele

---

### Fáze 3: Vizuální 2D Konfigurátor
**Status**: ⬜ Nezahájeno
**Cíl**: Interaktivní plátno pro sestavení vozidla s nástavbou

**Úkoly**:
- Konva.js canvas plátno (bokorys + nárys)
- Načtení podvozku jako základní silueta
- Drag & drop komponent na plátno
- Snap-to-grid a zarovnání
- Automatické rozměrové kóty
- Undo/redo (historie akcí)
- Uložení a načtení konfigurace
- Export canvas jako PNG/SVG

---

### Fáze 4: Výpočetní Engine
**Status**: ⬜ Nezahájeno
**Cíl**: Technické výpočty zatížení a stability v reálném čase

**Úkoly**:
- Výpočet zatížení přední a zadní nápravy (statické)
- Výpočet těžiště celého vozidla
- Stabilita jeřábu: klopný moment, maximální dosah, zatížení stabilizátorů
- Vizualizace výsledků na plátně (centrum těžiště, silové šipky)
- Grafy a přehledové tabulky výpočtů
- Upozornění při překročení limitů

---

### Fáze 5: Právní Checklist & Dokumentace
**Status**: ⬜ Nezahájeno
**Cíl**: Automatické právní upozornění a generování PDF protokolu

**Úkoly**:
- Databáze pravidel (zákon 56/2001, vyhl. 341/2002, 209/2018, ADR)
- Engine pro vyhodnocení pravidel podle konfigurace
- Tři úrovně upozornění: INFO / VAROVÁNÍ / BLOKUJÍCÍ
- UI panel s checklistem
- PDF generování: schéma, výpočty, checklist, BOM
- Správa verzí norem (datum platnosti)

---

### Fáze 6: Polish & Deployment
**Status**: ⬜ Nezahájeno
**Cíl**: Produkční nasazení, doladění UX, optimalizace

**Úkoly**:
- Responzivní layout (desktop-first)
- Loading states, error handling, prázdné stavy
- Audit výkonnosti (Lighthouse)
- Nastavení Appwrite pro produkci (self-hosted)
- Dokumentace pro administrátora
- Uživatelský onboarding / nápověda
- Finální testování s týmem

---

## Budoucí Milestony

### v2.0 — 3D Vizualizace
- Three.js + React Three Fiber
- 3D modely podvozků a nástaveb
- Realistický render pro zákazníka

### v2.1 — Certifikované Výpočty
- Validace výpočetního enginu certifikovaným inženýrem
- Možnost použití jako oficiální podklad

### v3.0 — Rozšíření
- Cenová kalkulace
- Projektový management (od objednávky po předání)
- Napojení na ERP
