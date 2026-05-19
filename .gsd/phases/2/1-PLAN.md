---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Appwrite Database Bootstrap & Bento Sync

## Objective
Nastavit automatickou inicializaci databázových tabulek v Appwrite a propojit Bento Grid launcher se synchronizací pozic kachliček (drag & drop) přes databázi pod uživatelským účtem.

## Context
- [.gsd/SPEC.md](file:///.gsd/SPEC.md)
- [.gsd/phases/2/RESEARCH.md](file:///.gsd/phases/2/RESEARCH.md)
- [src/lib/appwrite.ts](file:///home/jakub/github/propoj-app/src/lib/appwrite.ts)
- [src/stores/authStore.ts](file:///home/jakub/github/propoj-app/src/stores/authStore.ts)
- [src/shell/Desktop/BentoLauncher.tsx](file:///home/jakub/github/propoj-app/src/shell/Desktop/BentoLauncher.tsx)

## Tasks

<task type="auto">
  <name>Appwrite databázový adaptér a auto-bootstrap</name>
  <files>
    src/lib/appwrite.ts
    src/lib/dbSetup.ts
  </files>
  <action>
    1. Uprav `src/lib/appwrite.ts` — naimportuj `Databases` z `appwrite` a exportuj instanci `databases = new Databases(client)`.
    2. Vytvoř `src/lib/dbSetup.ts`:
       - Metoda `initializeDatabase()` spouštěná po přihlášení uživatele.
       - Zkontroluje, zda existuje databáze `canvas-os`. Pokud ne, pokusí se ji vytvořit přes Appwrite REST SDK (nebo použije defaultní `default` DB ID a pokusí se vytvořit kolekce `plugins` a `user_preferences`).
       - Pro zjednodušení na self-hosted instanci: budeme ukládat do databáze `canvas-os` (ID: `canvas-os` nebo `default`).
       - Vytvoří kolekci `plugins` s atributy: `name` (string), `description` (string), `url` (string), `icon` (string), `permissions` (string array / JSON string), `enabled` (boolean).
       - Vytvoří kolekci `user_preferences` s atributy: `userId` (string), `gridLayout` (string/text).
       - Ošetři catch bloky pro případ, kdy kolekce již existují (ignoruj error "collection already exists").
    3. Zavolej `initializeDatabase` po úspěšném přihlášení v `authStore.ts`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Databases instance je správně exportována a inicializační kód je typově bezpečný bez chyb.</done>
</task>

<task type="auto">
  <name>Bento Grid synchronizace pořadí do Appwrite</name>
  <files>
    src/stores/workspaceStore.ts
    src/shell/Desktop/BentoLauncher.tsx
  </files>
  <action>
    1. Uprav workspaceStore (nebo vytvoř `useLayoutStore` / `useBentoStore` v Zustand) pro uložení a perzistenci layoutu.
    2. Načti pořadí Bento kachliček z Appwrite `user_preferences` při spuštění OS shellu (po přihlášení).
    3. Při změně pořadí kachliček (drag & drop) ulož nové pole objektů `{ id, size, index }` do Appwrite databáze pod aktivním `userId`.
    4. Implementuj fallback na výchozí `APPS` uspořádání z `src/data/apps.ts`, pokud databáze neobsahuje žádné preference.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Pořadí kachliček se korektně načítá z databáze a ukládá při aktualizaci layoutu.</done>
</task>

## Success Criteria
- [ ] Databáze a kolekce se automaticky inicializují po přihlášení bez nutnosti ručního nastavování.
- [ ] Změny uspořádání Bento Gridu jsou perzistentní a synchronizované přes Appwrite Database.
- [ ] TypeScript kompilace proběhne bez chyb.
