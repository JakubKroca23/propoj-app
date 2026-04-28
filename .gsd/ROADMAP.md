# ROADMAP.md

> **Current Milestone**: V3.0
> **Goal**: Nasazení aplikace na vlastní Linux server a konfigurace domény `propoj.app` s Nginx.

## Must-Haves

- [ ] Stabilní produkční build (`dist` složka).
- [ ] Konfigurace Nginx pro obsluhu SPA (fallback na index.html).
- [ ] Přenos souborů na server (SCP/SFTP).
- [ ] SSL certifikát přes Let's Encrypt (Certbot).

## Nice-to-Haves

- [ ] Implementace automatizovaného deployment scriptu.

## Phases

### Phase 1: Build & Production Audit

**Status**: ⬜ Not Started
**Objective**: Verifikace buildu, kontrola environmentálních proměnných a příprava produkční konfigurace.

### Phase 2: Server Setup & Nginx Config

**Status**: ⬜ Not Started
**Objective**: Příprava serveru, instalace Nginx a vytvoření site konfigurace pro propoj.app.

### Phase 3: Deployment Execution

**Status**: ⬜ Not Started
**Objective**: Přenos buildu na server a spuštění aplikace.

### Phase 4: SSL & Security Polish

**Status**: ⬜ Not Started
**Objective**: Nastavení HTTPS pomocí Certbotu a finální verifikace funkčnosti.
