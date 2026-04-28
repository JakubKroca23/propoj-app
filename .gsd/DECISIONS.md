# DECISIONS.md

## Phase 2 Decisions

**Date:** 2026-04-28

### Scope
- Integrace dvou kolekcí Appwrite: `projects` (portfolio) a `messages` (kontakty).
- Implementace detailu projektu jako vysouvacího panelu (side panel/overlay), aby byl zachován vizuální kontext Hero sekce.

### Approach
- **Appwrite Data**: Kolekce `projects` obsahuje metadata včetně `thumbnail` (ID souboru), `tags`, `demo_url` a `github_url`.
- **UI/UX**: Pokračování v HUD estetice. Místo scrollování dolů budou projekty dostupné přes interaktivní prvek (např. tlačítko "Portfolio" v HUDu), který vysune panel s kartami.
- **Kontakt**: Jednoduché ukládání do Appwrite bez externích notifikací.

### Constraints
- Thumbnail je ID souboru, vyžaduje použití `storage.getFilePreview` z Appwrite SDK.
- Responzivita: Vysouvací panely musí fungovat na mobilu (překrytí celé obrazovky).
