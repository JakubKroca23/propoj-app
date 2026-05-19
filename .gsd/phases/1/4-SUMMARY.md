# Summary of Plan 1.4: WindowManager — Plovoucí okna, Drag, Resize, Z-index

## Accomplished
- Constructed a central `zIndexManager.ts` utility file for maintaining layer ordering, utilizing a base incrementor and allocating static spaces for taskbars (`9999`) and drag overlays (`9998`).
- Designed coordinate clampers (`windowUtils.ts`) preventing windows from being dragged completely off-screen or underneath taskbar constraints.
- Developed custom random UUID and timestamp fallbacks for generation of distinctive window tags.
- Programmed robust window manipulation methods inside Zustand (`windowStore.ts`) covering:
  - Cascade offsets for opened app panels.
  - Multi-trigger focus updates adjusting layering relative to z-index.
  - Minimization status toggles hiding containers.
  - Maximization triggers resizing layout to fixed full screen proportions.
- Programmed a draggable header wrapper using `@use-gesture/react`'s `useDrag` andSE corner click-and-drag resize capabilities (`Window.tsx`).
- Created macOS styled round colored control window buttons (`WindowHeader.tsx`).
- Engineered global iframe drag cover overlays (`WindowManager.tsx`) blocking event capturing during drag movements.
- Positioned `<WindowManager />` inside base `<Desktop />` viewport.
- Connected Bento Launcher grid clicks and bottom Taskbar tags to open, minimize, restore, and focus active apps.

## Verification
- Validated via zero-warning production compiling (`npm run build`) and clean TypeScript checks (`npx tsc --noEmit`).
