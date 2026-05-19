---
phase: 1
plan: 4
wave: 2
---

# Plan 1.4: WindowManager — Plovoucí okna, Drag, Resize, Z-index

## Objective
Implementovat plně funkční WindowManager: aplikace se otevírají jako plovoucí okna
s drag & drop přesouváním, resizováním, minimalizací a správou z-indexu.
Plugin iframe embedding funguje bez drag-bug. AppTile onClick otevírá okno.

## Context
- .gsd/DECISIONS.md (CSS/DOM Varianta A, @use-gesture/react, ZIndexManager, iframe overlay fix)
- src/stores/windowStore.ts (AppWindow typ a skeleton store)
- src/data/apps.ts

## Tasks

<task type="auto">
  <name>WindowManager Zustand store — CRUD operace nad okny</name>
  <files>
    src/stores/windowStore.ts
    src/utils/zIndexManager.ts
    src/utils/windowUtils.ts
  </files>
  <action>
    1. Rozšiř `src/stores/windowStore.ts` o všechny operace:
       ```ts
       interface WindowStore {
         windows: AppWindow[];
         openWindow: (app: AppDefinition) => void;
         closeWindow: (id: string) => void;
         focusWindow: (id: string) => void;      // přenese na popředí (z-index)
         minimizeWindow: (id: string) => void;
         restoreWindow: (id: string) => void;
         maximizeWindow: (id: string) => void;
         updatePosition: (id: string, x: number, y: number) => void;
         updateSize: (id: string, width: number, height: number) => void;
         isDragging: boolean;                    // globální drag state
         setIsDragging: (v: boolean) => void;
       }
       ```

       `openWindow` pravidla:
       - Pokud okno s `app.id` již existuje a není minimalizované → jen `focusWindow`
       - Pokud existuje ale je minimalizované → `restoreWindow`
       - Jinak vytvoř nové okno s výchozí pozicí (kaskádový offset: každé nové okno +30px od předchozího)
       - Výchozí size: `{ width: 800, height: 560 }`
       - Centrace: `x = (window.innerWidth - 800) / 2 + offset`, `y = (window.innerHeight - 560) / 2 + offset`

    2. Vytvoř `src/utils/zIndexManager.ts`:
       ```ts
       const BASE_Z = 100;
       let counter = BASE_Z;
       export const getNextZIndex = () => ++counter;
       export const TASKBAR_Z = 9999;
       export const OVERLAY_Z = 9998;
       ```

    3. Vytvoř `src/utils/windowUtils.ts`:
       - `clampPosition(x, y, width, height): {x, y}` — zabrání vytažení okna mimo obrazovku
       - `generateWindowId(): string` — `crypto.randomUUID()` nebo timestamp fallback

    POZOR: `isDragging` store state je kritické — Desktop musí poslouchat tento state
    a přidat `pointer-events: none` na iframy během dragu (iframe drag-bug fix).
  </action>
  <verify>cd /home/jakub/github/propoj-app && npx tsc --noEmit 2>&1 | head -20</verify>
  <done>windowStore.ts obsahuje všechny operace. TypeScript bez chyb.</done>
</task>

<task type="auto">
  <name>Window komponenta + WindowManager + AppTile integrace</name>
  <files>
    src/shell/WindowManager/Window.tsx
    src/shell/WindowManager/Window.css
    src/shell/WindowManager/WindowHeader.tsx
    src/shell/WindowManager/WindowManager.tsx
    src/shell/WindowManager/WindowManager.css
    src/shell/Desktop/Desktop.tsx
    src/shell/Desktop/AppTile.tsx
  </files>
  <action>
    1. Vytvoř `src/shell/WindowManager/WindowHeader.tsx`:
       - Props: `window: AppWindow`, `onClose`, `onMinimize`, `onMaximize`, `onFocus`
       - Vlevo: ikona app + název (z AppDefinition lookup podle window.appId)
       - Vpravo: 3 tlačítka (minimize, maximize, close) — macOS styl (červená/žlutá/zelená kulatá tlačítka)
       - Celý header je `drag-handle` plocha (cursor: grab)
       - Výška: 40px, `.glass` pozadí, border-bottom

    2. Vytvoř `src/shell/WindowManager/Window.tsx`:

       DRAG implementace s `@use-gesture/react`:
       ```tsx
       import { useDrag } from '@use-gesture/react';

       const bind = useDrag(({ offset: [x, y], first, last }) => {
         if (first) { windowStore.setIsDragging(true); windowStore.focusWindow(win.id); }
         if (last) windowStore.setIsDragging(false);
         const clamped = clampPosition(x, y, win.width, win.height);
         windowStore.updatePosition(win.id, clamped.x, clamped.y);
       }, {
         from: () => [win.x, win.y],
         bounds: { left: 0, top: 0, right: window.innerWidth - win.width, bottom: window.innerHeight - 96 }
       });
       ```
       Připni `bind()` na `WindowHeader` element.

       RESIZE implementace — resizable handles:
       - Přidej 8 resize handles (N, S, E, W, NE, NW, SE, SW) jako absolutní divs 8px
       - Pro jednoduchost v Fázi 1 stačí jen SE (pravý dolní roh) — `cursor: se-resize`
       - `useRef` pro resize state, `mousedown`/`mousemove`/`mouseup` eventy na document

       Struktura Window:
       ```tsx
       <div class="os-window" style={{ left: x, top: y, width, height, zIndex }}
            onClick={() => windowStore.focusWindow(id)}>
         <WindowHeader ... />
         <div class="window-content">
           {/* iframe nebo React komponenta — Fáze 1: placeholder */}
           <div class="window-placeholder">
             {icon} {name} – bude implementováno ve Fázi 3
           </div>
         </div>
         <div class="resize-handle se" />
       </div>
       ```

       CSS `.os-window`:
       ```css
       position: absolute;
       border-radius: var(--radius-lg);
       background: var(--bg-surface);
       border: 1px solid var(--border-default);
       box-shadow: var(--shadow-lg);
       overflow: hidden;
       display: flex; flex-direction: column;
       transition: box-shadow var(--transition-fast);
       animation: scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
       ```

       Maximalizace: pokud `isMaximized` → `position: fixed; inset: 0; border-radius: 0;`
       Minimalizace: `display: none` pokud `isMinimized`

    3. Vytvoř `src/shell/WindowManager/WindowManager.tsx`:
       - Renderuje všechna `windows` ze store
       - Pozicuje se absolutně přes celý Desktop: `position: absolute; inset: 0; pointer-events: none;`
       - Každé `<Window>` má `pointer-events: auto`
       - IFRAME DRAG BUG FIX: pokud `isDragging` → přidej `<div class="drag-overlay">` přes celou plochu
         `drag-overlay`: `position: fixed; inset: 0; z-index: var(--overlay-z); cursor: grabbing;`

    4. Uprav `src/shell/Desktop/Desktop.tsx`:
       - Přidej `<WindowManager />` jako absolutně pozicovaný child (position: relative na Desktop)

    5. Uprav `src/shell/Desktop/AppTile.tsx`:
       - `onClick` → `windowStore.openWindow(app)` (místo console.log)

    6. Přidej minimalizované okno indikátory do Taskbaru:
       - `src/shell/Taskbar/Taskbar.tsx` — zobrazuje minimalizovaná okna jako tlačítka
       - Click na minimalizované → `windowStore.restoreWindow(id)`

    POZOR: `@use-gesture/react` useDrag `from` option musí vracet aktuální pozici okna,
    jinak bude skákání při začátku dragu.
    POZOR: Window `onClick` (focusWindow) musí mít nižší prioritu než header drag — použij
    `stopPropagation` v drag handlerech.
  </action>
  <verify>cd /home/jakub/github/propoj-app && npx tsc --noEmit 2>&1 | head -20</verify>
  <done>
    Window.tsx existuje s drag (@use-gesture), resize a z-index správou.
    Kliknutí na AppTile otevře plovoucí okno.
    Okno lze přesouvat myší. Zavření/minimize/maximize funguje.
    TS bez chyb.
  </done>
</task>

## Success Criteria
- [ ] Kliknutím na AppTile se otevře plovoucí okno
- [ ] Okno lze myší přesouvat (drag) bez záseku na okrajích obrazovky
- [ ] Kliknutím na okno se přenese do popředí (z-index)
- [ ] Minimize schová okno, restore ho vrátí (přes Taskbar)
- [ ] Maximize roztáhne okno na celou obrazovku
- [ ] Zavření (×) okno odstraní ze store
- [ ] Více oken současně funguje bez z-index konfliktů
- [ ] `npx tsc --noEmit` bez chyb
