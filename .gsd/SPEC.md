# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Vytvořit technologicky špičkový portál `propoj.app`, který kombinuje vizuálně úchvatné veřejné portfolio (homepage) s vysoce zabezpečeným privátním dashboardem pro monitoring a správu na `admin.propoj.app`.

## Goals
1. **Dopaminová grafická pastva**: Implementovat pohlcující UI s Framer Motion, neonovými akcenty a moderní typografií (Inter/JetBrains Mono).
2. **Monitoring v reálném čase**: Zprovoznit sidecar kontejner pro bezpečný přístup k Docker statistikám a vizualizovat je v dashboardu.
3. **Appwrite Ekosystém**: Plná integrace Appwrite pro autentizaci, správu databáze projektů a sběr zpráv.
4. **ARM64 Optimalizace**: Robustní deployment v Dockeru na Ubuntu 24.04 ARM s podporou Traefik proxy a TLS.

## Non-Goals (Out of Scope)
- Veřejná registrace uživatelů (přístup pouze pro majitele).
- Přímé ovládání Docker kontejnerů (v první fázi pouze monitoring).
- Mobilní aplikace (pouze responzivní web).

## Users
- **Veřejnost**: Návštěvníci sledující portfolio na `https://propoj.app`.
- **Majitel (Admin)**: Jediný autorizovaný uživatel s přístupem k `https://admin.propoj.app` pro monitoring a správu.

## Constraints
- **Hardware**: ARM64 architektura (vyžaduje specifické Docker image).
- **Backend**: Appwrite je pevně daný backend na `appwrite.propoj.app`.
- **Styl**: Musí dodržet "JARVIS/Futuristic" dark mode (slate/zinc/blue).

## Success Criteria
- [ ] Plynulé animace HUD prvků bez propadu FPS.
- [ ] Funkční monitoring CPU/RAM a stavu kontejnerů v dashboardu.
- [ ] Bezpečné přihlášení omezené na konkrétní ID uživatele.
- [ ] Automatické nasazení přes docker-compose s funkčním HTTPS.
