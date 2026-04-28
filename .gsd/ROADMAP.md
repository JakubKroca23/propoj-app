# ROADMAP.md

> **Current Phase**: Phase 2: JARVIS UI & Portfolio (⬜ Not Started)
> **Milestone**: v1.0 - Initial Launch

## Must-Haves (from SPEC)

- [ ] JARVIS-style HUD UI (React + Framer Motion)
- [ ] Appwrite Auth & Database integration
- [ ] Docker Sidecar Monitoring API
- [ ] ARM64 optimized Docker deployment

## Phases

### Phase 1: Foundation & Infrastructure

**Status**: ✅ Complete

**Objective**: Nastavení základní struktury projektu, Dockeru a spojení s Appwrite.

**Deliverables**:

- React (Vite) + Tailwind + Shadcn základ.
- Dockerfile a docker-compose.yml pro ARM64.
- Appwrite Context & SDK inicializace.

### Phase 2: JARVIS UI & Portfolio

**Status**: [/] In Progress

**Objective**: Vytvoření vizuálně pohlcující veřejné části s dynamickými daty.

**Deliverables**:

- HUD/Futuristic design systém (Framer Motion).
- Dynamické načítání projektů z Appwrite Database.
- Kontaktní formulář propojený s Appwrite.

### Phase 3: Sidecar Monitoring & Admin Dashboard

**Status**: ⬜ Not Started

**Objective**: Implementace správy serveru a projektů na `admin.propoj.app`.

**Deliverables**:

- Sidecar API pro Docker statistiky.
- Admin Dashboard s autentizací (Appwrite Auth).
- Vizualizace CPU/RAM a stavu kontejnerů.
