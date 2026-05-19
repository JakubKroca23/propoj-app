---
phase: 2
plan: 3
wave: 3
---

# Plan 2.3: API Bridge Actions & Plugins Settings Manager

## Objective
Vybudovat postMessage komunikační bridge (OS ↔ plugin API), přidat rozhraní pro správu pluginů do systémového Nastavení a vytvořit funkční testovací plugin kalkulačky pro ověření end-to-end běhu.

## Context
- [.gsd/phases/2/RESEARCH.md](file:///.gsd/phases/2/RESEARCH.md)
- [src/shell/Shell.tsx](file:///home/jakub/github/propoj-app/src/shell/Shell.tsx)
- [src/apps/Settings/Settings.tsx](file:///home/jakub/github/propoj-app/src/apps/Settings/Settings.tsx)

## Tasks

<task type="auto">
  <name>postMessage API bridge a handler akcí</name>
  <files>
    src/shell/Shell.tsx
    src/utils/pluginBridge.ts
  </files>
  <action>
    1. Vytvoř soubor `src/utils/pluginBridge.ts` obsahující handler pro zprávy z pluginů.
    2. V `Shell.tsx` přidej `message` event listener na `window` objekt:
       - Při zachycení zprávy ověř její strukturu a přítomnost `windowId` a `token`.
       - Vyhledej odpovídající okno v `windowStore` a ověř shodu tokenu.
       - Pokud je token korektní, předej zprávu do `handlePluginAction` v `src/utils/pluginBridge.ts`.
    3. Implementuj podporu pro akce:
       - `canvas-os:notification` -> Vyvolá standardní web API `Notification` (nebo přidá záznam do budoucího oznamovacího centra, případně vyvolá alert/toast v Reactu).
       - `canvas-os:openWindow` -> Zavolá `windowStore.openWindow(app)`.
       - `canvas-os:closeWindow` -> Zavolá `windowStore.closeWindow(windowId)`.
       - `canvas-os:storage:set` a `canvas-os:storage:get` -> Ukládá/načítá klíč-hodnotu do perzistentního úložiště spojeného s daným `appId` pluginu.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>postMessage listener bezpečně filtruje, ověřuje a spouští požadavky odeslané z iframe.</done>
</task>

<task type="auto">
  <name>Správa pluginů v Nastavení</name>
  <files>
    src/apps/Settings/sections/PluginsSection.tsx
    src/apps/Settings/Settings.tsx
  </files>
  <action>
    1. Vytvoř komponentu `src/apps/Settings/sections/PluginsSection.tsx`:
       - Zobrazí seznam všech zaregistrovaných pluginů z Appwrite kolekce `plugins`.
       - Umožní přidat nový plugin zadáním jeho manifest URL (např. `http://localhost:5173/plugins/calculator/manifest.json`). OS stáhne manifest, zaregistruje ho do Appwrite DB a přidá do Bento launcheru.
       - Tlačítko pro Povolení/Zakázání (enable/disable) pluginu a jeho Odinstalaci.
    2. Naimportuj a vykresli `<PluginsSection />` v `src/apps/Settings/Settings.tsx` pod záložkou "Pluginy".
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Sekce Pluginy v Nastavení je plně funkční a provázaná s databází Appwrite.</done>
</task>

<task type="auto">
  <name>Testovací plugin kalkulačky v public složce</name>
  <files>
    public/plugins/calculator/manifest.json
    public/plugins/calculator/index.html
  </files>
  <action>
    1. Vytvoř `/public/plugins/calculator/manifest.json` popisující testovací aplikaci:
       ```json
       {
         "id": "calculator",
         "name": "Kalkulačka",
         "description": "Jednoduchá kalkulačka běžící jako plugin",
         "version": "1.0.0",
         "icon": "🧮",
         "entrypoint": "index.html",
         "permissions": ["notification"]
       }
       ```
    2. Vytvoř `/public/plugins/calculator/index.html`:
       - Vykreslí jednoduché UI kalkulačky v HTML/JS.
       - Obsahuje tlačítko "Odeslat notifikaci přes OS", které odešle postMessage zprávu:
         `window.parent.postMessage({ windowId, token, action: 'canvas-os:notification', payload: { message: 'Ahoj z kalkulačky!' } }, '*')`
       - Podporuje uložení výsledku přes bridge `canvas-os:storage:set`.
  </action>
  <verify>test -f public/plugins/calculator/manifest.json && test -f public/plugins/calculator/index.html</verify>
  <done>Testovací plugin je vytvořen a připraven ke spuštění a testování v izolovaném okně.</done>
</task>

## Success Criteria
- [ ] Vzkazy z pluginu (kalkulačky) jsou bezpečně přijímány a akce (notifikace, storage) se provedou v hostiteli.
- [ ] Uživatel může instalovat, zakazovat a odstraňovat pluginy přes Nastavení.
- [ ] Celý projekt projde `npm run build` bez chyb.
