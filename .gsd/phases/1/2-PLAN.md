---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Design Systém + Login stránka

## Objective
Vytvořit kompletní CSS design systém (CSS variables, dark/light mode, typografie, utility třídy)
a plně funkční Login stránku napojenu na Auth store. Po dokončení: vizuálně impresivní přihlašovací
obrazovka, která autentizuje uživatele přes Appwrite.

## Context
- .gsd/SPEC.md (UI Koncept: Canvas OS — deep navy #0D0F1A, violet #6C47FF, Inter font)
- .gsd/DECISIONS.md (dark/light mode přes CSS variables, React Context pro theme)
- src/stores/authStore.ts

## Tasks

<task type="auto">
  <name>CSS Design systém — variables, typography, utilities</name>
  <files>
    src/styles/variables.css
    src/styles/reset.css
    src/styles/typography.css
    src/styles/utilities.css
    src/styles/animations.css
    src/index.css
  </files>
  <action>
    1. Vytvoř `src/styles/variables.css` — KOMPLETNÍ design token systém:

       Dark mode (`:root` nebo `[data-theme="dark"]`):
       ```css
       --bg-base: #0D0F1A;
       --bg-surface: #13162A;
       --bg-elevated: #1A1E35;
       --bg-glass: rgba(19, 22, 42, 0.8);
       --border-subtle: rgba(255,255,255,0.06);
       --border-default: rgba(255,255,255,0.12);
       --accent-primary: #6C47FF;
       --accent-secondary: #8B6BFF;
       --accent-glow: rgba(108, 71, 255, 0.3);
       --text-primary: #F0F2FF;
       --text-secondary: #8B91B0;
       --text-muted: #4A5070;
       --success: #22C55E;
       --warning: #F59E0B;
       --error: #EF4444;
       --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
       --shadow-md: 0 4px 24px rgba(0,0,0,0.4);
       --shadow-lg: 0 8px 48px rgba(0,0,0,0.5);
       --radius-sm: 6px;
       --radius-md: 12px;
       --radius-lg: 20px;
       --radius-xl: 28px;
       --transition-fast: 150ms ease;
       --transition-base: 250ms ease;
       --transition-slow: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
       ```

       Light mode (`[data-theme="light"]`):
       ```css
       --bg-base: #F0F2FF;
       --bg-surface: #FFFFFF;
       --bg-elevated: #F8F9FF;
       --bg-glass: rgba(255,255,255,0.85);
       --border-subtle: rgba(0,0,0,0.05);
       --border-default: rgba(0,0,0,0.1);
       --accent-primary: #4F46E5;
       --accent-secondary: #6C63FF;
       --accent-glow: rgba(79, 70, 229, 0.2);
       --text-primary: #0F1020;
       --text-secondary: #4A5070;
       --text-muted: #8B91B0;
       --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
       --shadow-md: 0 4px 24px rgba(0,0,0,0.12);
       --shadow-lg: 0 8px 48px rgba(0,0,0,0.16);
       ```

    2. Vytvoř `src/styles/reset.css` — moderní CSS reset (box-sizing, margin 0, font-smoothing)

    3. Vytvoř `src/styles/typography.css`:
       - Import Google Fonts: Inter 400, 500, 600, 700
       - Base font: Inter, system-ui
       - Text size utilities: `.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`, `.text-2xl`, `.text-4xl`

    4. Vytvoř `src/styles/animations.css`:
       - `@keyframes fadeIn` — opacity 0→1
       - `@keyframes slideUp` — translateY(16px)→0 + fadeIn
       - `@keyframes slideDown` — translateY(-8px)→0 + fadeIn
       - `@keyframes scaleIn` — scale(0.95)→1 + fadeIn
       - `@keyframes pulse` — pro loading states
       - `.animate-fade-in`, `.animate-slide-up`, `.animate-scale-in` utility třídy

    5. Vytvoř `src/styles/utilities.css`:
       - Flexbox: `.flex`, `.flex-col`, `.items-center`, `.justify-center`, `.justify-between`, `.gap-1` až `.gap-8`
       - Pozice: `.relative`, `.absolute`, `.fixed`, `.inset-0`
       - Overflow: `.overflow-hidden`, `.overflow-auto`
       - Cursor: `.cursor-pointer`, `.cursor-grab`, `.cursor-grabbing`
       - `.glass` — glassmorphism: backdrop-filter blur + bg-glass + border-subtle
       - `.truncate` — text overflow ellipsis

    6. V `src/index.css` importuj všechny styly v pořadí:
       reset → variables → typography → utilities → animations

    POZOR: Nepoužívej Tailwind. Vše vanilla CSS.
    POZOR: `[data-theme]` se nastavuje na `<html>` elementu, ne na body.
  </action>
  <verify>cat src/styles/variables.css | grep -c "^  --" | awk '{print "Variables:", $1}'</verify>
  <done>variables.css existuje s min. 20 CSS proměnnými pro dark i light mode. index.css importuje všechny soubory.</done>
</task>

<task type="auto">
  <name>Login stránka — UI + integrace Auth store</name>
  <files>
    src/pages/Login.tsx
    src/styles/pages/Login.css
    src/contexts/ThemeContext.tsx
    src/App.tsx
  </files>
  <action>
    1. Vytvoř `src/contexts/ThemeContext.tsx`:
       - `ThemeProvider` — čte localStorage `'canvas-os-theme'`, fallback na OS preferenci
       - Nastavuje `data-theme` atribut na `document.documentElement`
       - Exportuje `useTheme()` hook → `{ theme, toggleTheme }`
       - Možné hodnoty: `'dark'` | `'light'`

    2. Vytvoř `src/pages/Login.tsx` — plně funkční přihlašovací stránka:

       Layout: Centrovana karta na gradientním pozadí
       - Pozadí: `radial-gradient(ellipse at 30% 50%, rgba(108,71,255,0.15) 0%, transparent 60%), var(--bg-base)`
       - Animované blob pozadí (CSS pseudo-elementy, jemný pohyb)
       - Karta: `.glass` + border + shadow-lg + border-radius-xl, min-width 400px
       - Logo/název "propoj.app" nahoře (stylizovaný text nebo SVG ikona)
       - Nadpis "Vítej zpět"
       - Subtitle "Přihlas se do svého Canvas OS"
       - Email input + Password input — custom styled (ne browser default)
       - Submit button — accent gradient, hover efekt, loading state (spinner)
       - Error message — červeně, animate-slide-down
       - Dark/light toggle tlačítko v pravém horním rohu obrazovky

       Stav komponenty:
       - `email`, `password` — controlled inputs
       - Na submit: `useAuthStore().login(email, password)`
       - Zobrazuj `error` ze store
       - Disable button při `isLoading`

    3. Uprav `src/App.tsx`:
       - Obal vše `ThemeProvider`
       - `useEffect` → `authStore.init()` při mountu
       - Pokud `isLoading` → zobrazuj full-screen spinner (`.animate-pulse`)
       - Pokud `!user` → renderuj `<Login />`
       - Pokud `user` → renderuj placeholder `<div>OS Shell bude zde</div>` (implementace v dalším plánu)

    POZOR: Login stránka musí být vizuálně impresivní — glassmorphism karta, gradient pozadí,
    smooth animace na mount (.animate-slide-up), hover efekty na inputech a buttonu.
    POZOR: Error stav ze stores zobraž jako animovaný alert pod formulářem, ne alert() dialog.
  </action>
  <verify>cd /home/jakub/github/propoj-app && npx tsc --noEmit 2>&1 | head -10</verify>
  <done>TypeScript bez chyb. Login.tsx existuje s ThemeContext integrací. App.tsx podmíněně renderuje Login vs placeholder.</done>
</task>

## Success Criteria
- [ ] `src/index.css` importuje kompletní design systém (reset, variables, typography, utilities, animations)
- [ ] Dark mode a light mode proměnné definovány pro všechny tokeny
- [ ] Login stránka se zobrazí při spuštění (user není přihlášen)
- [ ] Formulář volá `authStore.login()`, zobrazuje loading a error stavy
- [ ] ThemeContext existuje a přepíná `data-theme` na `<html>`
