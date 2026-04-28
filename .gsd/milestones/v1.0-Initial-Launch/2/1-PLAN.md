---
phase: 2
plan: 1
wave: 1
---

<!-- markdownlint-disable MD033 -->

# Plan 2.1: Appwrite Hooks & HUD Hub

## Objective

Implement the data layer using Custom Hooks and the main circular HUD control element.

## Context

- .gsd/DECISIONS.md
- src/lib/appwrite.ts

## Tasks

<task type="auto">
  <name>Create Appwrite Custom Hooks</name>
  <files>src/hooks/useProjects.ts, src/hooks/useContact.ts</files>
  <action>
    - Vytvořit `useProjects.ts`: Hook pro fetchování projektů z `propoj-main` DB. Implementovat `storage.getFilePreview` pro optimalizaci náhledů.
    - Vytvořit `useContact.ts`: Hook pro odesílání zpráv do kolekce `messages`.
  </action>
  <verify>Kontrola správného vracení dat a stavů (loading/error) v testovací komponentě.</verify>
  <done>Datová vrstva je oddělena od UI a připravena pro znovupoužití.</done>
</task>

<task type="auto">
  <name>Implement HudControls (Circular Hub)</name>
  <files>src/components/ui/HudControls.tsx</files>
  <action>
    - Vytvořit kruhový ovládací prvek v pravém dolním rohu.
    - Obsahuje dvě tlačítka: "PORTFOLIO" a "KONTAKT".
    - HUD estetika: neonové glow efekty, mono font, jemné rotace při hoveru.
  </action>
  <verify>Vizuální kontrola pozice a animací hubu.</verify>
  <done>Hlavní ovládací prvek JARVISu je funkční a stylový.</done>
</task>

## Success Criteria

- [ ] Data z Appwrite jsou dostupná přes čisté hooky.
- [ ] Kruhový HUB je fixně umístěn vpravo dole a reaguje na interakci.

