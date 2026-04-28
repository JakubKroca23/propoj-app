---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Aggressive HUD & Featured Projects

## Objective
Přidat agresivnější HUD prvky pro "wow efekt" a zobrazit vybrané (featured) projekty v rámci portálového rozhraní.

## Context
- src/components/sections/PortfolioShowcase.tsx
- src/hooks/useProjects.ts
- src/components/hud/HudOverlay.tsx

## Tasks

<task type="auto">
  <name>Featured Projects Display</name>
  <files>
    <file>src/components/sections/PortfolioShowcase.tsx</file>
  </files>
  <action>
    1. Implementovat filtrování v `PortfolioShowcase.tsx` tak, aby se zobrazovaly pouze projekty s `featured: true`.
    2. Navrhnout karty projektů tak, aby ladily s agresivním HUDem (technické popisky, ID projektů, minimalistické linky).
  </action>
  <verify>V portfoliu jsou vidět pouze vybrané (featured) projekty.</verify>
  <done>Zobrazení projektů je čisté a cílené.</done>
</task>

<task type="auto">
  <name>Aggressive HUD Elements</name>
  <files>
    <file>src/components/hud/HudOverlay.tsx</file>
  </files>
  <action>
    1. Do `HudOverlay.tsx` přidat nové vizuální prvky:
       - Rohové zaměřovače (corners).
       - Běžící textové řádky (logy systému) na okrajích.
       - Statické technické mřížky (grid overlay).
    2. Zajistit, aby tyto prvky byly "lehké" (použít CSS/jednoduché SVG) a nezpůsobovaly lagy.
  </action>
  <verify>HUD působí komplexněji a "agresivněji", ale stránka zůstává plynulá.</verify>
  <done>Landing page má špičkový "JARVIS" vizuál.</done>
</task>

## Success Criteria
- [ ] HUD obsahuje bohaté technické detaily bez dopadu na výkon.
- [ ] Jsou zobrazeny pouze vybrané (featured) projekty.
- [ ] Vizuální styl je 100% konzistentní a agresivní v mezích použitelnosti.
