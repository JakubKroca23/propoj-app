---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Portal Transition & Optimization

## Objective
Implementovat interaktivní přechod (Portal Transition) na hlavní stránce a zároveň optimalizovat výkon zjednodušením grafických efektů.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- src/components/sections/Hero.tsx
- src/hooks/useProjects.ts

## Tasks

<task type="auto">
  <name>Performance Optimization & Effect Simplification</name>
  <files>
    <file>src/components/sections/Hero.tsx</file>
  </files>
  <action>
    1. Redukovat počet částic (streaks) v `Hero.tsx` z 30 na ~10-15.
    2. Zjednodušit animace rotujících prstenců (použít čisté CSS `animate-spin` místo složitých Framer Motion loopů, kde je to možné).
    3. Odstranit nebo zjednodušit náročné SVG filtry/masky, které zpomalují rendering.
  </action>
  <verify>Stránka běží plynuleji (vysoké FPS) při zachování estetiky.</verify>
  <done>Efekty jsou optimalizovány pro plynulý běh.</done>
</task>

<task type="auto">
  <name>Portal Transition Logic</name>
  <files>
    <file>src/components/sections/Hero.tsx</file>
    <file>src/pages/LandingPage.tsx</file>
  </files>
  <action>
    1. Implementovat stav `isBooted` v `LandingPage.tsx`.
    2. Po kliknutí na tlačítko `BOOT_SYS` v Hero sekci spustit transformaci:
       - Hero sekce se "rozestoupí" nebo odzoomuje.
       - Zobrazí se HUD panely s daty projektů.
    3. Upravit `Hero.tsx` tak, aby předával událost kliknutí do rodiče.
  </action>
  <verify>Kliknutí na BOOT_SYS vyvolá plynulou transformaci UI bez skrolování.</verify>
  <done>Uživatel se interaktivně "přihlásí" do portfolia.</done>
</task>

## Success Criteria
- [ ] Stránka je výrazně plynulejší (odstraněny náročné efekty).
- [ ] Interaktivní přechod do portfolia funguje dle varianty B.
- [ ] Vizuál zůstává v Cyber Purple schématu.
