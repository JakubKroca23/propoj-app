# Plan 2.2: Asymmetrical HUD Panels

## Objective

Implement the sliding Portfolio and Contact panels with asymmetrical animations.

## Context

- .gsd/DECISIONS.md
- src/components/ui/HudControls.tsx

## Tasks

<task type="auto">
  <name>Finalize Portfolio Panel (Left Slide)</name>
  <files>src/components/ui/ProjectPanel.tsx</files>
  <action>
    - Upravit `ProjectPanel.tsx` pro vysouvání z **levého** okraje.
    - Propojit s `useProjects` hookem.
    - Implementovat optimalizované náhledy obrázků (getFilePreview).
  </action>
  <verify>Ověření, že panel vyjíždí zleva a zobrazuje reálná data.</verify>
  <done>Portfolio panel je plně funkční v asymetrickém rozvržení.</done>
</task>

<task type="auto">
  <name>Finalize Contact Panel (Right Slide)</name>
  <files>src/components/ui/ContactPanel.tsx</files>
  <action>
    - Upravit `ContactPanel.tsx` pro vysouvání z **pravého** okraje.
    - Propojit s `useContact` hookem pro odesílání paketů.
    - HUD styl formulářových polí (focus efekty, mono font).
  </action>
  <verify>Odeslání testovací zprávy a kontrola v Appwrite Database.</verify>
  <done>Kontaktní panel je funkční a ladí s HUD designem.</done>
</task>

## Success Criteria

- [ ] Panely se otevírají/zavírají asymetricky (zrcadlově).
- [ ] Celé rozhraní se chová jako ucelený Command Center.
