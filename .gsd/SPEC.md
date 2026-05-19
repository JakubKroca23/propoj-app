# SPEC.md — ProPoj: Konfigurátor Nástaveb

> **Status**: `FINALIZED`
> **Jazyk**: Česky
> **Datum**: 2026-05-19

---

## Vize

ProPoj je interní webová aplikace pro nástavbářskou firmu, která umožňuje vizuálně stavět a konfigurovat nákladní vozidla s nástavbami od základního podvozku až po hotový produkt. Kombinuje vizuální 2D/3D konfigurátor, databázi vozidel a komponent, technické výpočty (zatížení náprav, stabilita jeřábu), generování dokumentace a automatické právní checklisty podle platné české a evropské legislativy.

---

## Cíle

1. **Vizuální konfigurátor** — uživatel vizuálně sestaví vozidlo s nástavbou na interaktivním plátně (2D bokorys + nárys, výhledově 3D)
2. **Technické výpočty** — výpočet zatížení náprav, distribuce hmotnosti, stabilita jeřábu (klopný moment, dosah výložníku, zatížení stabilizátorů)
3. **Databáze komponent** — katalog podvozků (Mercedes, MAN, DAF, Volvo...), nástaveb (plachta, skříň, jeřáb, cisterna, sklápěč...) a příslušenství (světla, blatníky, podpěry...) — stovky položek
4. **Právní checklist** — automatická upozornění na povinnosti dle konfigurace (zákon 56/2001 Sb., vyhlášky o rozměrech/hmotnostech, světlech, blatnících, ADR, EN normy)
5. **Generování dokumentace** — PDF protokol s výpočty, technickým schématem a checklistem pro přihlášení vozidla (STK, přestavba)

---

## Non-Goals (Mimo rozsah v1.0)

- Certifikované výpočty (orientační v1.0, certifikace jako budoucí milestone)
- 3D vizualizace (plánovaná jako v2.0)
- Napojení na veřejné registry vozidel (ruční import)
- Mobilní aplikace
- Zákaznický portál (pouze interní použití)
- E-commerce / objednávky

---

## Uživatelé

Interní tým ~20 uživatelů s rolemi:

| Role | Popis |
|------|-------|
| **Admin** | Správa databáze vozidel, komponent, norem; správa uživatelů |
| **Konstruktér** | Vytváří konfigurace, provádí výpočty, generuje protokoly |
| **Obchodník** | Sestavuje nabídky, zobrazuje konfigurace, tiskne dokumenty |
| **Technik** | Sleduje co je potřeba namontovat, checklist |

---

## Technický Stack

| Vrstva | Technologie | Důvod |
|--------|-------------|-------|
| **Frontend** | React 18 + TypeScript + Vite | Robustní, typově bezpečný, rychlý HMR |
| **UI Framework** | shadcn/ui + Radix UI | Přístupné, plně customizovatelné komponenty |
| **Styling** | Tailwind CSS | Rychlý vývoj, konzistentní design system |
| **State** | Zustand + TanStack Query | Lokální stav + server state management |
| **2D Vizualizace** | Konva.js + React-Konva | Výkonný 2D canvas, drag & drop, transformace |
| **3D Vizualizace** | Three.js + React Three Fiber | Budoucí 3D, stejný ekosystém |
| **Výpočty** | math.js + vlastní engine | Přesné fyzikální výpočty |
| **Backend** | Appwrite | Auth, databáze, storage, realtime, serverless functions |
| **PDF generování** | @react-pdf/renderer | Profesionální PDF dokumenty |
| **Routing** | React Router v6 | SPA routing |

---

## Klíčové Funkce

### 1. Vizuální Konfigurátor
- Interaktivní plátno (2D bokorys + nárys)
- Drag & drop komponent z katalogu na vozidlo
- Přichycování ke gridům (snap-to-grid)
- Rozměrové kóty (automatické)
- Export schématu jako SVG/PNG/PDF
- Historie akcí (undo/redo)

### 2. Databáze Komponent
- Podvozky: rozvor, délka rámu, nosnost náprav, hmotnost, motor
- Nástavby: typ, rozměry, hmotnost, požadavky na podvozek
- Příslušenství: světla, blatníky, podpěry, hydraulika, elektrika
- Vyhledávání, filtrování, kompatibilita

### 3. Výpočetní Engine
- Zatížení přední/zadní nápravy (statické + dynamické)
- Těžiště nástavby a celku
- Stabilita jeřábu: klopný moment, max. dosah při zatížení, zatížení stabilizátorů
- Vizualizace výsledků (grafy, diagramy)

### 4. Právní Checklist
- Pravidla vázaná na konfiguraci (rozměry → blatníky, hmotnost → pneumatiky atd.)
- Zdroj: zákon 56/2001 Sb., vyhl. 341/2002 Sb., 209/2018 Sb., ADR, EN normy
- Tři úrovně: INFO / VAROVÁNÍ / BLOKUJÍCÍ (nelze generovat dok. bez potvrzení)
- Verze norem s datem platnosti

### 5. Dokumentace & Výstupy
- PDF protokol: technický popis, schéma, výpočty, checklist
- Přehled konfigurace (BOM — seznam komponent)
- Export pro přestavbové řízení

---

## Constraints

- Interní síť firmy, ale přístup přes prohlížeč (web app)
- Appwrite jako backend (samohosteditelný)
- Čeština jako primární jazyk UI
- Musí běžet bez internetu (případně — nutno upřesnit)
- GDPR — ukládání dat o projektech/vozidlech

---

## Success Criteria

- [ ] Uživatel může vizuálně sestavit konfiguraci vozidla za < 30 minut
- [ ] Výpočet zatížení náprav odpovídá ručnímu výpočtu ± 2%
- [ ] Systém upozorní na 100% povinných zákonných požadavků pro danou konfiguraci
- [ ] Vygenerované PDF je přijato jako podklad pro přestavbové řízení
- [ ] Všechny role mohou pracovat bez školení > 1 hodiny
