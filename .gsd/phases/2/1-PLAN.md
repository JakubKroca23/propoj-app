---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Project Portfolio & HUD Cards

## Objective
Implement a visually matching project portfolio section that loads data dynamically from Appwrite.

## Context
- .gsd/SPEC.md
- .gsd/phases/2/RESEARCH.md
- src/lib/appwrite.ts
- src/components/sections/Hero.tsx (for visual reference)

## Tasks

<task type="auto">
  <name>Create HudCard Component</name>
  <files>src/components/ui/HudCard.tsx</files>
  <action>
    Vytvořit komponentu `HudCard.tsx` s asymetrickým tvarem (clip-path), neonovými okraji a hover efekty, které ladí s `HudButton`. 
    - Použít `framer-motion` pro efekty při najetí.
    - Zobrazit náhled obrázku, název, tagy a odkaz.
  </action>
  <verify>Ruční kontrola vizuálu v prohlížeči.</verify>
  <done>Komponenta je stylově konzistentní s Hero sekcí.</done>
</task>

<task type="auto">
  <name>Implement Projects Section</name>
  <files>src/components/sections/Projects.tsx, src/App.tsx</files>
  <action>
    - Vytvořit sekci `Projects.tsx`, která se dotáže na Appwrite Database (kolekce 'projects').
    - Přidat placeholder data, pokud je databáze prázdná.
    - Integrovat sekci do `App.tsx` pod Hero sekci.
  </action>
  <verify>npm run dev a kontrola načtení dat (včetně fallbacku).</verify>
  <done>Projekty se vykreslují v HUD kartách pod hlavní sekcí.</done>
</task>

## Success Criteria
- [ ] Karty projektů mají sci-fi design a animace.
- [ ] Data se načítají asynchronně z Appwrite.
