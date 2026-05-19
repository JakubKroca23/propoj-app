---
phase: 1
plan: 5
wave: 3
---

# Plan 1.5: Settings Panel + Dark/Light Mode + Leštění

## Objective
Implementovat Settings panel (přepínač dark/light, uživatelský profil) a dokončit
všechny zbývající detaily Fáze 1: command bar skeleton, animace, edge cases.
Po dokončení je Fáze 1 kompletní a připravená na Fázi 2 (Plugin systém).

## Context
- .gsd/DECISIONS.md (Nastavení patří do Fáze 1, dark/light + profil)
- src/contexts/ThemeContext.tsx
- src/stores/authStore.ts
- src/stores/windowStore.ts

## Tasks

<task type="auto">
  <name>Settings aplikace — panel s dark/light a profilem</name>
  <files>
    src/apps/Settings/Settings.tsx
    src/apps/Settings/Settings.css
    src/apps/Settings/sections/AppearanceSection.tsx
    src/apps/Settings/sections/ProfileSection.tsx
    src/shell/WindowManager/Window.tsx
    src/data/apps.ts
  </files>
  <action>
    1. Vytvoř `src/apps/Settings/Settings.tsx` — Settings aplikace (otevírá se v okně):

       Layout: Sidebar + Content area
       ```
       <div class="settings-panel">
         <aside class="settings-sidebar">
           <nav>
             <button class="settings-nav-item active">👤 Profil</button>
             <button class="settings-nav-item">🎨 Vzhled</button>
             <button class="settings-nav-item">🖥️ Pracovní plochy</button>
             <button class="settings-nav-item">🔌 Pluginy</button> {/* placeholder */}
           </nav>
         </aside>
         <main class="settings-content">
           {activní sekce}
         </main>
       </div>
       ```

    2. Vytvoř `src/apps/Settings/sections/ProfileSection.tsx`:
       - Zobrazí avatar (iniciály v kruhu, accent barva)
       - Jméno, email z `authStore.user`
       - Tlačítko "Odhlásit se" → `authStore.logout()`
       - Informace: Appwrite Project ID (z env), verze aplikace "v1.0.0-alpha"

    3. Vytvoř `src/apps/Settings/sections/AppearanceSection.tsx`:
       - **Theme toggle** — dva velké radio-style karty: "Tmavý režim" / "Světlý režim"
         s náhledem (malý preview box s barvami) + checkbox indikátor aktivního
       - Volá `useTheme().toggleTheme()` při výběru
       - **Accent barva** — řada barevných kruhů (violet, blue, green, orange, red)
         Uložení do localStorage `'canvas-os-accent'` a CSS variable `--accent-primary` update
         (bonus feature — pokud je komplexní, zůstaň jen u dark/light toggle)
       - **Animace** — toggle "Redukovat pohyb" (ukládá do localStorage, přidává
         `@media (prefers-reduced-motion)` override přes class na `<html>`)

    4. Uprav `src/shell/WindowManager/Window.tsx` — Settings okno otevírá `<Settings />`:
       - Pokud `window.appId === 'settings'` → renderuj `<Settings />` jako window content
       - Pro ostatní appId zatím placeholder (implementace Fáze 3+)
       - Pattern pro Fázi 3+:
         ```tsx
         const getAppContent = (appId: string) => {
           switch(appId) {
             case 'settings': return <Settings />;
             default: return <AppPlaceholder appId={appId} />;
           }
         };
         ```

    5. Uprav `src/data/apps.ts` — Settings app má `component` odkaz na Settings komponentu.

    POZOR: Settings musí plně fungovat v plovoucím okně (overflow: auto v .window-content).
    POZOR: Theme změna musí být okamžitě viditelná (bez page reload) — ThemeContext to zajistí.
  </action>
  <verify>cd /home/jakub/github/propoj-app && npx tsc --noEmit 2>&1 | head -20</verify>
  <done>Settings.tsx existuje a otevírá se v plovoucím okně. Dark/light toggle funguje okamžitě. TS bez chyb.</done>
</task>

<task type="auto">
  <name>Command Bar skeleton + finální leštění + Fáze 1 uzavření</name>
  <files>
    src/shell/CommandBar/CommandBar.tsx
    src/shell/CommandBar/CommandBar.css
    src/shell/Shell.tsx
    src/styles/utilities.css
    src/index.css
  </files>
  <action>
    1. Vytvoř `src/shell/CommandBar/CommandBar.tsx` — Universal Command Bar:
       - Otevírá se přes `Ctrl+K` (globální keyboard listener v Shell.tsx)
       - Modal overlay: tmavé pozadí + centrovnaá search box
       - Input s ikonou lupy, placeholder "Hledat aplikace, soubory, příkazy..."
       - Výsledky: filtruje `APPS` dle query (case-insensitive match na name/description)
       - Výsledkový řádek: ikona + název + description + klávesová zkratka
       - Enter / klik na výsledek → `windowStore.openWindow(app)`
       - Escape → zavři
       - Animace: slideDown 200ms při otevření

       V Fázi 1 vyhledává pouze aplikace. Fáze 3 přidá soubory, poznámky, události.

    2. Uprav `src/shell/Shell.tsx`:
       - Přidej `useEffect` pro globální `keydown` listener:
         ```ts
         const handleKeyDown = (e: KeyboardEvent) => {
           if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
             e.preventDefault();
             setCommandBarOpen(v => !v);
           }
         };
         ```
       - Renderuj `{commandBarOpen && <CommandBar onClose={() => setCommandBarOpen(false)} />}`

    3. Finální leštění — zkontroluj a oprav:
       - [ ] Všechna okna mají správný `overflow: hidden` (obsah nevypadává)
       - [ ] Taskbar má `z-index: var(--taskbar-z)` (vždy nad okny)
       - [ ] BentoLauncher má krásný cascade animace mountu (stagger delay 50ms per tile)
       - [ ] Login stránka — zkontroluj error handling, loading state, disabled button
       - [ ] Přidej favicon: SVG "P" v accent barvě do `/public/favicon.svg`
       - [ ] `index.html` — title "Canvas OS — propoj.app", meta description

    4. Přidej do `src/styles/utilities.css` zbývající utility třídy:
       - `.sr-only` — screen reader only (accessibility)
       - `.no-select` — `user-select: none` (důležité pro drag handles)
       - `.pointer-events-none` — pro iframe overlay fix

    5. Vytvoř `/public/favicon.svg`:
       ```svg
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
         <rect width="32" height="32" rx="8" fill="#6C47FF"/>
         <text x="16" y="22" text-anchor="middle" font-family="Inter,sans-serif"
               font-weight="700" font-size="18" fill="white">P</text>
       </svg>
       ```

    POZOR: Command Bar musí mít `position: fixed` overlay (ne relative k Desktop).
    POZOR: `useEffect` cleanup — vždy `document.removeEventListener` v return funkci.
  </action>
  <verify>cd /home/jakub/github/propoj-app && npx tsc --noEmit 2>&1 | head -5 && echo "--- Build ---" && npm run build 2>&1 | tail -8</verify>
  <done>
    Command Bar se otevře přes Ctrl+K a filtruje aplikace.
    Settings panel funguje v plovoucím okně.
    Build projde bez chyb.
    Favicon viditelný v záložce.
  </done>
</task>

## Success Criteria
- [ ] `Ctrl+K` otevře Command Bar, který filtruje a spouští aplikace
- [ ] Settings okno se otevře a zobrazí profil uživatele
- [ ] Dark/light mode přepínání funguje v Settings
- [ ] `npm run build` projde bez chyb nebo varování
- [ ] Fáze 1 kompletní — OS Shell vizuálně hotový, auth funguje, WindowManager plně funkční
