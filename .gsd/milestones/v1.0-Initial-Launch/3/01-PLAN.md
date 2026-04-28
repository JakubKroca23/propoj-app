---
phase: 3
plan: 1
wave: 1
depends_on: []
files_modified: ["docker-compose.yml", "sidecar/package.json", "sidecar/Dockerfile", "sidecar/index.ts"]
autonomous: true
---

# Plan 3.1: Sidecar Infrastructure Setup

<objective>
Nastavení základní infrastruktury pro Sidecar API, která bude sbírat statistiky o Docker kontejnerech.
</objective>

<context>
- .gsd/SPEC.md
- .gsd/phases/3/RESEARCH.md
- docker-compose.yml
</context>

<tasks>

<task type="auto">
  <name>Create Sidecar Boilerplate</name>
  <files>sidecar/package.json, sidecar/Dockerfile, sidecar/index.ts, sidecar/tsconfig.json</files>
  <action>
    Vytvořit adresář `sidecar` s minimálním Node.js/TypeScript boilerplate.
    - `package.json`: Přidat závislosti `express`, `dockerode`, `node-appwrite`, `cors`, `dotenv` a dev deps pro TS.
    - `Dockerfile`: Multi-stage build pro ARM64 (node:20-alpine).
    - `index.ts`: Základní Express server naslouchající na portu 3001.
    - `tsconfig.json`: Standardní TS konfigurace pro Node.
  </action>
  <verify>Testování sestavení Docker image: `docker build -t propoj-sidecar ./sidecar`</verify>
  <done>Soubory existují a Docker image se úspěšně sestaví.</done>
</task>

<task type="auto">
  <name>Integrate Sidecar into Docker Compose</name>
  <files>docker-compose.yml</files>
  <action>
    Přidat službu `sidecar` do `docker-compose.yml`.
    - Namountovat `/var/run/docker.sock:/var/run/docker.sock`.
    - Nastavit environment proměnné (APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, ADMIN_USER_ID).
    - Přidat Traefik labely pro expozici na `api.propoj.app` (volitelně, zatím stačí interní síť nebo specifický port).
    - Připojit k síti `appwrite`.
  </action>
  <verify>Spuštění `docker-compose up -d sidecar` a kontrola logů.</verify>
  <done>Služba sidecar běží a má přístup k docker socketu.</done>
</task>

</tasks>

<verification>
- [ ] Sidecar kontejner je definován a lze jej spustit.
- [ ] Sidecar má přístup k `/var/run/docker.sock`.
</verification>

<success_criteria>
- [ ] Infrastruktura pro monitoring je připravena k implementaci logiky.
</success_criteria>
