---
phase: 3
plan: 3
wave: 3
---

# Plan 3.3: Úkoly a Integrace Core Aplikací (Úkoly & Window Mount)

## Objective
Implementovat hybridní aplikaci **Úkoly** (s přepínáním Kanban a List View a plným drag & drop přetažením sloupců) a integrovat všechny vytvořené core aplikace (Poznámky, Kalendář, Soubory, PDF Viewer, Úkoly) do systémového registru aplikací a WindowManageru pro plnohodnotné spouštění.

## Context
- [.gsd/SPEC.md](file:///.gsd/SPEC.md)
- [.gsd/phases/3/RESEARCH.md](file:///.gsd/phases/3/RESEARCH.md)
- [src/stores/tasksStore.ts](file:///home/jakub/github/propoj-app/src/stores/tasksStore.ts)
- [src/data/apps.ts](file:///home/jakub/github/propoj-app/src/data/apps.ts)
- [src/shell/WindowManager/Window.tsx](file:///home/jakub/github/propoj-app/src/shell/WindowManager/Window.tsx)

## Tasks

<task type="auto">
  <name>Aplikace Úkoly s Kanban deskou a Drag & Drop</name>
  <files>
    src/apps/Tasks/Tasks.tsx
    src/apps/Tasks/Tasks.css
  </files>
  <action>
    1. Vytvoř složku `src/apps/Tasks` a soubory `Tasks.tsx` a `Tasks.css`.
    2. Vytvoř hybridní rozhraní:
       - Horní lišta: Přepínač zobrazení (Kanban Board vs. Seznam), filtr podle priority (vše, vysoká, střední, nízká), formulář pro rychlé přidání nového úkolu s výběrem priority a názvu.
       - Kanban zobrazení: Tři sloupce (`Nedokončeno`, `Probíhá`, `Hotovo`). Karty úkolů s názvem, popisem, datem splnění a prioritním barevným badge.
       - Seznam (List View): Kompaktní tabulkový řádkový výpis s možností rychlého odškrtnutí (checkbox).
    3. Nativní HTML5 Drag & Drop:
       - Karty v Kanbanu mají atribut `draggable`. Při dragu ulož ID úkolu.
       - Sloupce mají handlery `onDragOver` (zabraňuje defaultnímu chování) a `onDrop`.
       - Drop na sloupec zavolá `updateTask(taskId, { status: 'target_status' })`.
    4. Widget a parametry:
       - Úkoly lze odškrtávat přímo na ploše v widgetu (zavoláním `toggleTaskStatus`), což se ihned přenese do storu i backendu.
       - Pokud obdrží parametr `win.params?.taskId`, daný úkol vizuálně zvýrazni (přidej blikající záři nebo pulzování) a otevři jeho editaci.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Aplikace Úkoly se kompiluje, podporuje drag & drop přetahování karet, přepínání pohledů a dynamické parametry.</done>
</task>

<task type="auto">
  <name>Registrace a namontování core aplikací v systému</name>
  <files>
    src/data/apps.ts
    src/shell/WindowManager/Window.tsx
  </files>
  <action>
    1. Uprav `src/data/apps.ts`:
       - Naimportuj React komponenty `Notes`, `Calendar`, `FileManager`, `PdfViewer` a `Tasks`.
       - Přiřaď tyto komponenty do příslušných definic v seznamu `APPS` pod klíč `component`.
    2. Uprav `src/shell/WindowManager/Window.tsx`:
       - Odstraň textové placeholdery pro nově integrované aplikace.
       - Dynamicky vyhledej a vykresli zaregistrovanou React komponentu z registru `APPS` podle `win.appId`.
       - Předej komponentě celou instanci okna `window={win}` a parametry `params={win.params}` jako props.
    3. Ověř integritu sestavení celého Canvas OS.
  </action>
  <verify>
    npx tsc --noEmit
    npm run build
  </verify>
  <done>Všechny core aplikace jsou zaregistrovány a spouštějí se z Bento launcherů, desktopových zástupců, widgetů nebo vyhledávání.</done>
</task>

## Success Criteria
- [ ] Aplikace Úkoly funguje s přetahováním karet a hybridním zobrazením.
- [ ] Všechny 5 aplikací (Poznámky, Kalendář, Soubory, PDF, Úkoly) jsou namontovány a spustitelné.
- [ ] Celý systém projde sestavením a typovou kontrolou bez chyb.
