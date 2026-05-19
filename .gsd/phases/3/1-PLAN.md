---
phase: 3
plan: 1
wave: 2
---

# Plan 3.1: Dokumenty a Časový plán (Poznámky & Kalendář)

## Objective
Implementovat dvě klíčové produktivní aplikace: **Poznámky** (rich-text editor Tiptap) a **Kalendář** (custom React/CSS Grid zobrazení) s plnou synchronizací dat do globálních Zustand stores a desktopových widgetů a s podporou otevírání specifických entit přes předané parametry z Command Baru nebo widgetů.

## Context
- [.gsd/SPEC.md](file:///.gsd/SPEC.md)
- [.gsd/phases/3/RESEARCH.md](file:///.gsd/phases/3/RESEARCH.md)
- [src/stores/notesStore.ts](file:///home/jakub/github/propoj-app/src/stores/notesStore.ts)
- [src/stores/calendarStore.ts](file:///home/jakub/github/propoj-app/src/stores/calendarStore.ts)
- [src/shell/Desktop/Desktop.tsx](file:///home/jakub/github/propoj-app/src/shell/Desktop/Desktop.tsx)

## Tasks

<task type="auto">
  <name>Aplikace Poznámky s editorem Tiptap a perzistencí</name>
  <files>
    src/apps/Notes/Notes.tsx
    src/apps/Notes/Notes.css
  </files>
  <action>
    1. Vytvoř složku `src/apps/Notes` a soubory `Notes.tsx` a `Notes.css`.
    2. Vytvoř layout:
       - Levý panel (boční panel): vyhledávací pole poznámek, tlačítko "Nová poznámka", seznam poznámek (zobrazuje název, krátké preview obsahu bez HTML tagů a tagy), seznam tagů pro filtrování seznamu.
       - Pravý panel (editor): Tiptap editor (`useEditor` s `StarterKit`).
    3. Stylování: Plný glassmorphismus, transparentní barvy, fialové akcenty pro aktivní prvky. Podpora světlého i tmavého režimu pomocí systémových CSS variables (`var(--bg-card-glass)`, `var(--border-color)` atd.).
    4. Propojení se storem:
       - Výpis poznámek z Zustand `useNotesStore`.
       - Vytvoření nové poznámky tlačítkem a okamžité načtení do editoru.
       - Automatické ukládání (debounce 800ms) názvu, obsahu a tagů do Appwrite přes `updateNote`.
       - Smazání aktivní poznámky s potvrzovacím dialogem.
    5. Parametry okna: Pokud je přes `win.params?.noteId` předáno ID, automaticky tuto poznámku načti a aktivuj jako vybranou.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Aplikace Poznámky se správně kompiluje, integruje Tiptap editor a bez chyb ukládá poznámky do storu.</done>
</task>

<task type="auto">
  <name>Aplikace Kalendář s CSS Grid a správou událostí</name>
  <files>
    src/apps/Calendar/Calendar.tsx
    src/apps/Calendar/Calendar.css
  </files>
  <action>
    1. Vytvoř složku `src/apps/Calendar` a soubory `Calendar.tsx` a `Calendar.css`.
    2. Vytvoř layout:
       - Hlavička kalendáře s názvem měsíce (např. "Květen 2026") a navigačními šipkami (předchozí/následující měsíc).
       - Řádek s názvy dnů v týdnu (Po, Út, St, Čt, Pá, So, Ne).
       - Grid 7x6 / 7x5 pro zobrazení dnů v aktuálním měsíci. Každá buňka zobrazuje číslo dne a malé barevné tagy pro události, které na daný den připadají.
    3. Správa událostí (Modal):
       - Kliknutí na den otevře glassmorphic modal "Nová událost" s předvyplněným datem.
       - Kliknutí na zobrazenou událost otevře modal s detaily a možnostmi "Upravit" nebo "Smazat".
       - Možnost vybrat barvu události (např. fialová, zelená, modrá, červená), název, popis, čas začátku/konce a přepínač "Celý den".
    4. Parametry okna: Pokud je přes `win.params?.eventId` předáno ID události, automaticky přepni kalendář na měsíc události, zvýrazni ji a otevři její detailní modal.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Aplikace Kalendář zobrazuje správný grid měsíce, umožňuje zakládat a mazat události v kalendáři a správně reaguje na předané parametry událostí.</done>
</task>

## Success Criteria
- [ ] Aplikace Poznámky funguje s editorovým jádrem Tiptap a ukládá rich-text data.
- [ ] Aplikace Kalendář renderuje bezchybně dny v týdnu i měsíci a spravuje události.
- [ ] Propojení widgetů a otevírání entit z widgetů / Command Baru funguje přes `win.params`.
- [ ] TypeScript kompilace proběhne bez chyb.
