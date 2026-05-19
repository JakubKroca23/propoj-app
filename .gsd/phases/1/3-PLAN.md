---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: OS Shell — Desktop, Taskbar, Workspaces, Launcher

## Objective
Implementovat kompletní OS Shell skeleton: uživatel po přihlášení vidí Canvas OS plochu
s Bento Grid Launcherem, Taskbarem a přepínačem Workspaces. Shell je vizuálně hotový,
připravený na WindowManager (Plan 1.4) a napojení core aplikací (Fáze 3+).

## Context
- .gsd/SPEC.md (UI Koncept: bento grid, taskbar dole, workspaces)
- .gsd/DECISIONS.md (workspaces bez persistence v Fázi 1)
- src/contexts/ThemeContext.tsx
- src/stores/authStore.ts

## Tasks

<task type="auto">
  <name>Workspaces Zustand store + OS Shell kořenový layout</name>
  <files>
    src/stores/workspaceStore.ts
    src/stores/windowStore.ts
    src/shell/Shell.tsx
    src/shell/Shell.css
    src/App.tsx
  </files>
  <action>
    1. Vytvoř `src/stores/workspaceStore.ts` (Zustand):
       ```ts
       interface Workspace {
         id: string;
         name: string;
         icon: string; // emoji nebo název ikony
         color: string; // accent barva workspace
       }
       interface WorkspaceState {
         workspaces: Workspace[];
         activeId: string;
         setActive: (id: string) => void;
         addWorkspace: (name: string) => void;
       }
       ```
       - Výchozí workspaces: Osobní (🏠, violet), Práce (💼, blue), Finance (💰, green)
       - `setActive` jen mění `activeId` (bez Appwrite v Fázi 1)

    2. Vytvoř `src/stores/windowStore.ts` (Zustand) — skeleton pro Plan 1.4:
       ```ts
       interface WindowState {
         windows: AppWindow[];
         // metody přidány v Plan 1.4
       }
       ```
       Definuj `AppWindow` typ:
       ```ts
       interface AppWindow {
         id: string;
         appId: string;
         title: string;
         icon: string;
         x: number; y: number;
         width: number; height: number;
         zIndex: number;
         isMinimized: boolean;
         isMaximized: boolean;
       }
       ```

    3. Vytvoř `src/shell/Shell.tsx` — kořenový OS layout:
       ```
       <div class="os-shell">
         <Desktop />        {/* střed — plocha s okny */}
         <Taskbar />        {/* dole — taskbar */}
       </div>
       ```
       CSS pro `.os-shell`: `display: grid; grid-template-rows: 1fr auto; height: 100vh; overflow: hidden; background: var(--bg-base);`

    4. Uprav `src/App.tsx` — po přihlášení renderuj `<Shell />` místo placeholderu.

    POZOR: Shell.tsx je čistě layout — neobsahuje žádnou business logiku, jen skládá subkomponenty.
  </action>
  <verify>cd /home/jakub/github/propoj-app && npx tsc --noEmit 2>&1 | head -10</verify>
  <done>workspaceStore.ts a windowStore.ts existují. Shell.tsx renderuje bez TS chyb.</done>
</task>

<task type="auto">
  <name>Desktop + BentoLauncher + Taskbar komponenty</name>
  <files>
    src/shell/Desktop/Desktop.tsx
    src/shell/Desktop/Desktop.css
    src/shell/Desktop/BentoLauncher.tsx
    src/shell/Desktop/BentoLauncher.css
    src/shell/Desktop/AppTile.tsx
    src/shell/Desktop/AppTile.css
    src/shell/Desktop/DesktopWidget.tsx
    src/shell/Taskbar/Taskbar.tsx
    src/shell/Taskbar/Taskbar.css
    src/shell/Taskbar/WorkspaceSwitcher.tsx
    src/shell/Taskbar/TaskbarClock.tsx
    src/shell/Taskbar/TaskbarUserMenu.tsx
    src/data/apps.ts
  </files>
  <action>
    1. Vytvoř `src/data/apps.ts` — registry dostupných aplikací (skeleton, rozšíří se ve Fázi 3+):
       ```ts
       export interface AppDefinition {
         id: string;
         name: string;
         icon: string;        // emoji nebo SVG string
         description: string;
         color: string;       // tile accent barva
         size: 'sm' | 'md' | 'lg'; // bento tile velikost
         component?: React.LazyExoticComponent<any>; // lazy-loaded, null v Fázi 1
       }
       export const APPS: AppDefinition[] = [
         { id: 'files', name: 'Soubory', icon: '📁', description: 'Správce souborů', color: '#F59E0B', size: 'md' },
         { id: 'notes', name: 'Poznámky', icon: '📝', description: 'Rich-text poznámky', color: '#6C47FF', size: 'md' },
         { id: 'calendar', name: 'Kalendář', icon: '📅', description: 'Události a připomínky', color: '#22C55E', size: 'md' },
         { id: 'tasks', name: 'Úkoly', icon: '✅', description: 'Kanban a seznam', color: '#3B82F6', size: 'md' },
         { id: 'finance', name: 'Finance', icon: '💰', description: 'Příjmy a výdaje', color: '#10B981', size: 'md' },
         { id: 'email', name: 'Email', icon: '📧', description: 'IMAP inbox', color: '#EF4444', size: 'md' },
         { id: 'weather', name: 'Počasí', icon: '🌤', description: 'Předpověď počasí', color: '#0EA5E9', size: 'sm' },
         { id: 'settings', name: 'Nastavení', icon: '⚙️', description: 'Systémová nastavení', color: '#8B91B0', size: 'sm' },
         { id: 'game', name: 'Strategie', icon: '⚔️', description: 'RTS hra', color: '#DC2626', size: 'lg' },
       ]
       ```

    2. Vytvoř `src/shell/Desktop/AppTile.tsx` — jedna dlaždice v Bento Launcheru:
       - Props: `app: AppDefinition`, `onClick: () => void`
       - Vizuál: zaoblená karta s gradient pozadím (barva app + průhlednost), ikona (velká emoji/SVG), název
       - Hover: scale(1.04) + glow shadow v barvě app + cursor pointer
       - Animace mountu: `.animate-scale-in` s `animation-delay` podle indexu (cascade efekt)
       - Velikost tile dle `app.size`: sm=1×1, md=1×1, lg=2×1 grid buňky

    3. Vytvoř `src/shell/Desktop/BentoLauncher.tsx`:
       - CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))`, `gap: 16px`
       - Renderuje `<AppTile>` pro každou app z `APPS`
       - `onClick` na tile: zatím `console.log('open:', app.id)` — WindowManager přijde v Plan 1.4
       - Přidej 2-3 `<DesktopWidget>` placeholdery (Počasí, Čas, Poslední soubory)

    4. Vytvoř `src/shell/Desktop/DesktopWidget.tsx` — placeholder widget karta:
       - Props: `title: string`, `icon: string`, `children?: React.ReactNode`
       - Vizuál: `.glass` karta, menší než AppTile, subtitle "Bude dostupné brzy"
       - Stačí jako skeleton pro Fázi 4

    5. Vytvoř `src/shell/Desktop/Desktop.tsx`:
       - Plná výška, overflow auto
       - Padding: 24px
       - Nadpis sekce "Aplikace" + BentoLauncher
       - Pod tím widgety řada

    6. Vytvoř `src/shell/Taskbar/TaskbarClock.tsx`:
       - `useEffect` + `setInterval(1000)` → aktualizuje čas každou sekundu
       - Zobrazuje: `HH:MM` (velký) + datum `Den DD. Měsíc` (malý, lokalizace cs-CZ)

    7. Vytvoř `src/shell/Taskbar/WorkspaceSwitcher.tsx`:
       - Zobrazí workspace tlačítka (ikona + název)
       - Aktivní workspace = accent barva + podtržení
       - `onClick` → `workspaceStore.setActive(id)`

    8. Vytvoř `src/shell/Taskbar/TaskbarUserMenu.tsx`:
       - Avatar tlačítko (iniciály uživatele z Appwrite `user.name`)
       - Dropdown menu (CSS, bez knihovny): Profil, Nastavení, Odhlásit se
       - `onClick Odhlásit` → `authStore.logout()`

    9. Vytvoř `src/shell/Taskbar/Taskbar.tsx`:
       - Layout: `display: flex; align-items: center; justify-content: space-between`
       - Vlevo: WorkspaceSwitcher
       - Střed: TaskbarClock
       - Vpravo: minimalizovaná okna placeholder + TaskbarUserMenu
       - Vizuál: `.glass`, `backdrop-filter: blur(20px)`, border-top, výška 56px, padding 0 16px

    POZOR: Všechny CSS soubory musí být importovány v příslušném TSX souboru.
    POZOR: Neimplementuj otevírání oken — to je Plan 1.4. AppTile onClick = jen console.log.
  </action>
  <verify>cd /home/jakub/github/propoj-app && npm run dev -- --port 5174 &amp; sleep 4 &amp; curl -s http://localhost:5174 | grep -q "Canvas OS" &amp;&amp; echo "Server OK" || echo "Check manually"</verify>
  <done>
    Všechny komponenty existují a TS compile projde bez chyb.
    V prohlížeči po přihlášení vidíš: Desktop s AppTile mřížkou + Taskbar s hodinami a workspaces.
  </done>
</task>

## Success Criteria
- [ ] `npx tsc --noEmit` projde bez chyb
- [ ] Po přihlášení se zobrazí OS Shell (Desktop + Taskbar)
- [ ] BentoLauncher zobrazí min. 9 dlaždic (dle APPS registry)
- [ ] Taskbar zobrazuje aktuální čas, workspaces a user menu
- [ ] Přepínání workspaces funguje vizuálně
- [ ] Logout z user menu odhlásí a vrátí na Login
