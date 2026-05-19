---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Nástavbářská RTS Hra — Herní Engine & Canvas

## Objective
Implementovat plnohodnotnou mini-RTS strategickou hru v odlehčeném Warcraft 2 stylu s českým nástavbářským a strojírenským tématem ("Sabotáž v Montáži s.r.o."). Hra poběží na HTML5 `<canvas>` s vysokým výkonem a bude ukládat nejlepší výsledky (High Scores) do perzistentní Appwrite databáze.

## Context
- [.gsd/SPEC.md](file:///home/jakub/github/propoj-app/.gsd/SPEC.md) (REQ-16)
- [.gsd/DECISIONS.md](file:///home/jakub/github/propoj-app/.gsd/DECISIONS.md) (Fáze 5 Rozhodnutí)
- [src/lib/dbSetup.ts](file:///home/jakub/github/propoj-app/src/lib/dbSetup.ts)
- [src/data/apps.ts](file:///home/jakub/github/propoj-app/src/data/apps.ts)

## Tasks

<task type="auto">
  <name>Datová vrstva a Appwrite high scores</name>
  <files>
    <file>src/lib/dbSetup.ts</file>
    <file>src/stores/gameStore.ts</file>
  </files>
  <action>
    1. Rozšířit `src/lib/dbSetup.ts`:
       - Definovat a exportovat `COLLECTION_GAME = 'game_highscores'`.
       - V `initializeDatabase()` přidat kontrolní `databases.listDocuments` pro ověření a bootstrap kolekce `game_highscores`.
    2. Vytvořit Zustand store `src/stores/gameStore.ts`:
       - Definovat typy pro `HighScore` (id, userId, userName, score, durationSeconds, wavesSurvived, date).
       - Implementovat stav pro seznam nejlepších skóre `highScores` a akce `loadHighScores()`, `saveHighScore(score, duration, waves, userId, userName)` a `resetGame()`.
       - Integrovat robustní local storage / mock fallback při nedostupnosti sítě nebo nepodporované kolekci.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Datová vrstva existuje, správně inicializuje kolekci a Zustand store podporuje synchronizaci skóre bez kompilačních chyb.
  </done>
</task>

<task type="auto">
  <name>Čistý TypeScript Canvas Game Engine</name>
  <files>
    <file>src/apps/Game/Engine/GameEngine.ts</file>
  </files>
  <action>
    Vytvořit soubor `src/apps/Game/Engine/GameEngine.ts` obsahující herní jádro:
    1. Třída `GameEngine` spravující `<canvas>` element a herní loop (`requestAnimationFrame`).
    2. Model jednotek (Stroje):
       - **Šasi (Worker)**: sbírá ocel ze Šrotiště na gridu a vozí do Hlavní dílny.
       - **Jeřábový vůz (Builder)**: staví a opravuje budovy.
       - **Čelní nakladač (Melee)**: útočí radlicí zblízka na nepřátele.
       - **Hasičská plošina (Ranged)**: stříká vodu na dálku a hasí.
    3. Model budov:
       - **Hlavní dílna (HQ)**: sběrné místo oceli a montáž Šasi / Jeřábů.
       - **Montážní hala (Assembly)**: montáž Nakladačů / Hasičů.
       - **Sklad součástek (Depot)**: zvyšuje populační limit.
       - **Automatický důl (Steel Mine)**: automaticky těží ocel na mřížce.
    4. Nepřátelé (Sabotéři): periodicky se spawnovat v rozích a útočit na Hlavní dílnu.
    5. Grid systém (např. 16x16 nebo 20x20 mřížka) pro stavbu a umisťování budov, detekci kolizí, těžbu a pohyb (jednoduchý A* nebo přímá trajektorie).
    6. Fog of War (poloprůhledná černá vrstva odkrývající se u jednotek a budov).
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Herní engine je kompletně napsán v čistém TypeScriptu a zkompilován bez jediné chyby.
  </done>
</task>

<task type="auto">
  <name>Uživatelské rozhraní hry a registrace</name>
  <files>
    <file>src/apps/Game/Game.tsx</file>
    <file>src/apps/Game/Game.css</file>
    <file>src/data/apps.ts</file>
  </files>
  <action>
    1. Vytvořit komponentu `src/apps/Game/Game.tsx`:
       - React obal pro `<canvas>`, inicializuje `GameEngine` a propojuje ho s `useGameStore`.
       - Stavová lišta (celková ocel, aktuální populace strojírenského parku, vlna nepřátel).
       - Postranní montážní a stavební panel (nákup budov na gridu a výroba specializovaných vozidel).
       - Modální okna (Game Over, Victory) se zápisem a odesláním výsledků do Appwrite databáze.
       - Sekce „Síň slávy“ (Leaderboard) s nejlepšími výsledky staženými ze storu.
    2. Vytvořit glassmorphic CSS styly v `src/apps/Game/Game.css` s pohlcující industriální atmosférou.
    3. Registrovat `Game` v `src/data/apps.ts` importem komponenty a jejím namontováním do pole `APPS` (id: 'game').
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Hra je plně hratelná, reaguje na myš (drag selection, pohyb, stavění), ukládá skóre a je integrována do jádra Canvas OS.
  </done>
</task>

## Success Criteria
- [ ] Uživatel může spustit hru "Strategie" jako plnohodnotnou aplikaci.
- [ ] Lze stavět budovy na gridu, těžit ocel, vyrábět speciální stroje a bránit dílnu proti sabotérům.
- [ ] Výsledné skóre se po konci hry perzistentně ukládá do Appwrite databáze.
- [ ] Produkční sestavení proběhne bez chyb.
