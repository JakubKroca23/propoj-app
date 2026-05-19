---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: Polishing, Vanilla CSS animace & Lazy Loading

## Objective
Optimalizovat výkon celého operačního systému zavedením asynchronního **Lazy Loading & Code Splitting** pro všechny core aplikace (snížení počáteční velikosti bundlu) a přidat špičkové CSS micro-interactions pro luxusní visual feel operačního systému.

## Context
- [.gsd/SPEC.md](file:///home/jakub/github/propoj-app/.gsd/SPEC.md) (REQ-06)
- [.gsd/DECISIONS.md](file:///home/jakub/github/propoj-app/.gsd/DECISIONS.md) (Fáze 5 Rozhodnutí)
- [src/data/apps.ts](file:///home/jakub/github/propoj-app/src/data/apps.ts)
- [src/shell/WindowManager/Window.tsx](file:///home/jakub/github/propoj-app/src/shell/WindowManager/Window.tsx)

## Tasks

<task type="auto">
  <name>Lazy loading a Code Splitting core aplikací</name>
  <files>
    <file>src/data/apps.ts</file>
    <file>src/shell/WindowManager/Window.tsx</file>
  </files>
  <action>
    1. Upravit `src/data/apps.ts`:
       - Nahradit statické importy aplikací (Settings, FileManager, Notes, Calendar, Tasks, PdfViewer, Finance, Weather, Email a nově Game) za asynchronní dynamic imports pomocí `React.lazy()`.
       - Příklad: `const Notes = React.lazy(() => import('@/apps/Notes/Notes'))`.
    2. Upravit `src/shell/WindowManager/Window.tsx`:
       - Zabalit dynamic render komponenty `AppComponent` do `<React.Suspense>` s elegantním glassmorphic spinnerem jako fallbackem.
       - Příklad:
         ```tsx
         <React.Suspense fallback={<div className="app-loading-fallback">Načítání...</div>}>
           <AppComponent window={win} />
         </React.Suspense>
         ```
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Aplikace se stahují asynchronně až při prvním otevření a počáteční velikost hlavního JS balíku (bundle) se výrazně zmenšila.
  </done>
</task>

<task type="auto">
  <name>Vanilla CSS Micro-interactions a keyframe animace</name>
  <files>
    <file>src/shell/Desktop/AppTile.css</file>
    <file>src/shell/WindowManager/Window.css</file>
  </files>
  <action>
    1. Rozšířit `src/shell/Desktop/AppTile.css`:
       - Přidat smooth active state a hover bounce 3D efekty (transformace a stíny) na Bento kachličky.
       - Zamezit trhání textů při transformacích pomocí `will-change: transform`.
    2. Rozšířit `src/shell/WindowManager/Window.css`:
       - Přidat plynulou keyframes animaci při otevírání oken (např. elegantní scale a fade-in z polohy `scale(0.95)` na `scale(1)` a `opacity: 1`).
       - Optimalizovat minimalizaci oken s plynulým fade-out efektem.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Celé rozhraní OS působí extrémně responzivně, plynule a prémiově při jakýchkoliv interakcích.
  </done>
</task>

## Success Criteria
- [ ] Všechny core aplikace se načítají dynamicky pomocí `React.lazy`.
- [ ] Otevírání, zavírání a minimalizace oken a hover kachliček mají plynulé a vizuálně úchvatné CSS animace.
- [ ] Produkční sestavení proběhne bez chyb a s menším výchozím asset bundle size.
