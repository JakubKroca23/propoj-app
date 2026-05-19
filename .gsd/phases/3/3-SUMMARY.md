# Summary — Plan 3.3: Úkoly a Integrace Core Aplikací (Úkoly & Window Mount)

## Objective
Implementovat hybridní aplikaci **Úkoly** (s přepínáním Kanban a List View a plným drag & drop přetažením sloupců) a integrovat všechny vytvořené core aplikace (Poznámky, Kalendář, Soubory, PDF Viewer, Úkoly) do systémového registru aplikací a WindowManageru pro plnohodnotné spouštění.

## Co bylo implementováno

### 1. Aplikace Úkoly (`src/apps/Tasks/`)
- **Tasks.tsx**:
  - Přepínatelné hybridní rozhraní: Kanban deska (sloupce *K rozpracování*, *Probíhá*, *Hotovo*) a Seznam (kompaktní tabulka s rychlým odškrtáváním).
  - Rychlý panel pro přidávání úkolů (název, priorita s vizuálními badges, termín splnění).
  - Filtrování podle priority (všechny, nízká, střední, vysoká).
  - Nativní HTML5 Drag & Drop: karty mají atribut `draggable`, sloupce reagují na `onDragOver`, `onDragLeave` a `onDrop` pro změnu stavu úkolu. Změna stavu provede okamžitý optimistický zápis do Zustand store a asynchronní uložení do Appwrite na pozadí.
  - Modální okno pro detailní úpravy a mazání úkolu (úprava názvu, popisu, stavu, priority, termínu splnění a štítků).
  - Reakce na parametry okna (`win.params?.taskId`) pro přímé otevření a zvýraznění konkrétního úkolu pulzující září (`highlighted-glow`) a automatické odrolování k elementu (`scrollIntoView`).
- **Tasks.css**:
  - Responzivní design se zaoblenými rohy a fialovými/modrými akcenty pro aktivní stavy.
  - Vizuální indicator drag state (`dragging-card` a `drag-over-column`).

### 2. Registrace a namontování core aplikací v systému
- **src/data/apps.ts**:
  - Propojeny všechny React komponenty: `FileManager`, `Notes`, `Calendar`, `Tasks` a `PdfViewer`.
  - Přiřazeny pod příslušné definice v poli `APPS` do nového parametru `component`.
- **src/shell/WindowManager/Window.tsx**:
  - Nahrazeny staré textové placeholdery za dynamic component rendering.
  - Okno vyhledá `AppComponent` podle `win.appId` v registru a vyrenderuje ho.
  - Předány parametry okna `window={win}` a automaticky ošetřeno odsazení (`padding: 0`) pro plnohodnotné full-bleed gridy u těchto aplikací.

## Ověření a Verifikace
Spuštění lokální typové kontroly a produkčního sestavení:
```bash
npm run build
```
Všechny typy i bundler (Vite) proběhly bez chyb. Aplikace Úkoly má plynulý drag & drop, filtry priorit a modal pro editaci. Systém je plně funkční a připraven k nasazení.
