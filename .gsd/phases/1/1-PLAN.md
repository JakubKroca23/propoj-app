---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Inicializace projektu + Appwrite Auth

## Objective
Vytvořit funkční základ projektu: Vite+React+TS projekt s nainstalovanými závislostmi,
nakonfigurovaným Appwrite klientem a Zustand Auth store (login, logout, session check).
Po dokončení: `npm run dev` spustí prázdnou aplikaci, Appwrite auth funguje.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md

## Tasks

<task type="auto">
  <name>Inicializace Vite+React+TS projektu a instalace závislostí</name>
  <files>
    package.json
    vite.config.ts
    tsconfig.json
    tsconfig.app.json
    index.html
    src/main.tsx
    src/App.tsx
    src/vite-env.d.ts
    .env.local
    .gitignore
  </files>
  <action>
    1. Inicializuj Vite projekt: `npm create vite@latest . -- --template react-ts` (přepsat existující soubory)
    2. Nainstaluj závislosti:
       ```
       npm install appwrite@25.1.1 zustand@5.0.13 @use-gesture/react@10.3.1
       npm install -D @types/node
       ```
    3. Vytvoř `.env.local` s proměnnými:
       ```
       VITE_APPWRITE_ENDPOINT=https://appwrite.propoj.app/v1
       VITE_APPWRITE_PROJECT_ID=69effdf6003ce697ee83
       ```
    4. V `.gitignore` přidej `.env.local`
    5. V `vite.config.ts` přidej `resolve.alias` pro `@` → `./src`
    6. V `tsconfig.app.json` přidej paths alias: `"@/*": ["./src/*"]`
    7. Smaž vygenerovaný boilerplate z `src/App.tsx` a `src/App.css`, `src/index.css` — nechej prázdné soubory
    8. `src/main.tsx` — standardní React 18 mount, bez StrictMode (iframy v dev modu se mountují dvakrát)

    POZOR: Neupravuj `index.html` jinak než přidat správný title "Canvas OS — propoj.app"
  </action>
  <verify>cd /home/jakub/github/propoj-app && npm run build 2>&1 | tail -5</verify>
  <done>Build proběhne bez chyb. package.json obsahuje appwrite, zustand, @use-gesture/react.</done>
</task>

<task type="auto">
  <name>Appwrite klient + Auth Zustand store</name>
  <files>
    src/lib/appwrite.ts
    src/stores/authStore.ts
    src/types/index.ts
  </files>
  <action>
    1. Vytvoř `src/lib/appwrite.ts`:
       ```ts
       import { Client, Account } from 'appwrite';

       const client = new Client()
         .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
         .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

       export const account = new Account(client);
       export default client;
       ```

    2. Vytvoř `src/types/index.ts` s typy:
       - `AppwriteUser` — Models.User<Models.Preferences> (re-export z appwrite)
       - `AuthState` — interface pro Zustand store

    3. Vytvoř `src/stores/authStore.ts` (Zustand):
       ```ts
       interface AuthState {
         user: AppwriteUser | null;
         isLoading: boolean;
         error: string | null;
         init: () => Promise<void>;       // check existing session
         login: (email: string, password: string) => Promise<void>;
         logout: () => Promise<void>;
       }
       ```
       - `init()`: volá `account.get()`, nastaví user nebo null (catch → user = null, bez erroru)
       - `login()`: `account.createEmailPasswordSession(email, password)` → pak `account.get()`
       - `logout()`: `account.deleteSession('current')` → user = null
       - Vždy spravuj `isLoading` a `error` state

    POZOR: V appwrite@25.x je metoda `createEmailPasswordSession` (ne `createEmailSession`)
    POZOR: Nepoužívej `any` typy — importuj `Models` z `'appwrite'`
  </action>
  <verify>cd /home/jakub/github/propoj-app && npx tsc --noEmit 2>&1 | head -20</verify>
  <done>TypeScript compile bez chyb. Soubory src/lib/appwrite.ts a src/stores/authStore.ts existují.</done>
</task>

## Success Criteria
- [ ] `npm run dev` spustí aplikaci bez chyb v konzoli
- [ ] `npm run build` projde bez TS chyb
- [ ] `.env.local` obsahuje Appwrite endpoint a project ID
- [ ] `authStore.ts` exportuje `useAuthStore` hook s `init`, `login`, `logout`
