# DECISIONS.md

## Phase 2 Decisions

**Date:** 2026-04-28

### Scope

- Integrace dvou kolekcí Appwrite: `projects` (portfolio) a `messages` (kontakty).
- Implementace detailu projektu jako vysouvacího panelu (side panel/overlay), aby byl zachován vizuální kontext Hero sekce.
- **UI Update**: Hlavní ovládací prvky (Portfolio, Kontakt) budou integrovány do kruhového HUD elementu v pravém dolním rohu obrazovky.
- **Asymetrické animace**: Portfolio panel se vysouvá z **levého** okraje, Kontakt panel z **pravého** okraje. Tím se dosáhne vizuální rovnováhy "Command Center".

### Approach

- **Chose**: Option B (Custom Hooks & Service Layer)
- **Reason**: Zajišťuje znovupoužitelnost logiky pro budoucí Admin Dashboard (Fáze 3) a čistší separaci UI od datové vrstvy.
- **Appwrite Data**: Kolekce `projects` obsahuje metadata včetně `thumbnail` (ID souboru), `tags`, `demo_url` a `github_url`.
- **Database ID**: `propoj-main`.
- **Optimization**: Využití `storage.getFilePreview` pro dynamickou kompresi a změnu velikosti náhledů projektů přímo z Appwrite.

### Constraints

- Responzivita: Kruhový element se na mobilu může transformovat do zjednodušeného menu nebo FAB (Floating Action Button).

## Phase 3 Decisions

**Date:** 2026-04-28

### Scope
- **URL**: Admin dashboard bude dostupný na cestě `propoj.app/admin` v rámci hlavní React aplikace.
- **Monitoring**: Sběr metrik pro všechny běžící Docker kontejnery na hostiteli.

### Approach
- **Sidecar API**: Vlastní Node.js Express server s `dockerode`.
- **Security**: Verifikace pomocí Appwrite JWT + whitelist konkrétního `ADMIN_USER_ID` v environment proměnných.
- **Real-time**: Polling dat každých 5 sekund (považováno za dostatečné pro v1.0).
- **Design**: JARVIS HUD estetika s vizualizací zátěže CPU/RAM.

### Constraints
- Sidecar vyžaduje mount `/var/run/docker.sock`, což omezuje deployment na prostředí s Dockerem.
- Vyžaduje nastavení Traefik routování pro `/api/*` požadavky na sidecar kontejner.

