---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: JARVIS Portfolio Panel

## Objective
Implement a sliding HUD panel for the project portfolio, integrated with Appwrite.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- src/lib/appwrite.ts

## Tasks

<task type="auto">
  <name>Create ProjectPanel & HudCard</name>
  <files>src/components/ui/ProjectPanel.tsx, src/components/ui/HudCard.tsx</files>
  <action>
    - Vytvořit `ProjectPanel.tsx`: Boční/překryvný panel (Framer Motion), který se vysune z okraje obrazovky.
    - Vytvořit `HudCard.tsx`: Komponenta pro jeden projekt využívající `thumbnail` ID (Appwrite Storage preview) a neonový HUD styl.
    - Implementovat animace pro plynulý vstup/výstup panelu.
  </action>
  <verify>Ruční testování animací vysouvání panelu.</verify>
  <done>Panel se plynule vysouvá a obsahuje stylové karty projektů.</done>
</task>

<task type="auto">
  <name>Fetch Projects from Appwrite</name>
  <files>src/components/ui/ProjectPanel.tsx, src/lib/appwrite.ts</files>
  <action>
    - Implementovat dotaz na kolekci `projects`.
    - Zpracovat pole: `title`, `description`, `thumbnail` (přes `getFilePreview`), `tags`, `demo_url`, `github_url`.
    - Řadit podle pole `order` a filtrovat `featured`.
  </action>
  <verify>Kontrola načtených dat v konzoli a vykreslení v kartách.</verify>
  <done>Data jsou dynamicky načítána z Appwrite podle specifikovaného schématu.</done>
</task>

## Success Criteria
- [ ] Portfolio funguje jako interaktivní "modul" HUDu bez nutnosti scrollování stránky.
- [ ] Karty projektů zobrazují náhledy ze Storage.
