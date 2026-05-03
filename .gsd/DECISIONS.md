# Decisions

> Previous milestone decisions archived in `.gsd/milestones/v2.0/DECISIONS.md`

---

## Phase 4: Landing Page Refresh

**Date:** 2026-04-28

### Scope
- Pouze kosmetické změny a interaktivní přechod.
- Zobrazení pouze projektů označených jako `featured`.

### Approach
- **Portal Transition (Option B):** Hero sekce funguje jako "vstupní brána". Po kliknutí se transformuje do zobrazení portfolia bez skrolování.

### Constraints & Style
- **HUD:** Agresivnější vizuál (více HUD prvků, skenování, textových polí), ale technicky zjednodušený (méně náročné na výkon).
- **Barvy:** Zachování Cyber Purple / Cyan / Neon schématu.
- **Performance:** Nutnost optimalizace efektů (např. omezení počtu částic/streaků), které způsobují sekání stránky.

## Workflow: Public vs Dev Sections

**Date:** 2026-05-03

### Definitions
- **PUBLIC Section:** What appears when clicking the middle "Initialize" button on the Landing Page (`PortfolioShowcase`).
- **DEV Section:** The Admin/Dashboard area protected by login, accessible via the top-right "Admin Access" button (`Dashboard`, `AdminPage`).

### Staged Development Rule
- When working on "DEV", changes should be confined to the admin sections and not affect the public portfolio.
- Public updates only occur upon explicit request to "flip" or "deploy" DEV changes to PUBLIC.
- This ensures a stable public presence while developing new features.
