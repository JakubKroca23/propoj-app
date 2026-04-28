---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified:
  - Dockerfile
  - .dockerignore
  - nginx.conf
autonomous: true
must_haves:
  truths:
    - "Docker image se úspěšně sestaví bez chyb"
    - "Kontejner běží a obsluhuje aplikaci na portu 80"
  artifacts:
    - "Dockerfile"
    - "nginx.conf"
---

# Plan 3.1: Dockerization & Build Audit

<objective>
Vytvoření produkčního Docker kontejneru pro aplikaci propoj.app.
- Cíl: Zabalit React aplikaci do lehkého Nginx kontejneru.
- Výstup: Funkční Dockerfile a konfigurace Nginx.
</objective>

<context>
Load for context:
- package.json
- vite.config.ts
- .env
</context>

<tasks>

<task type="auto">
  <name>Create Dockerfile and Nginx configuration</name>
  <files>Dockerfile, .dockerignore, nginx.conf</files>
  <action>
    - Vytvořit multi-stage Dockerfile (build stage s Node.js, production stage s Nginx).
    - Vytvořit nginx.conf, který správně směruje všechny požadavky na index.html (SPA routing).
    - Zajistit, aby Dockerfile přijímal ARG pro VITE_Appwrite proměnné a propisoval je do buildu.
    - AVOID: Používání plného Node.js image v produkční fázi. Použij alpine verze pro minimální velikost.
  </action>
  <verify>docker build -t propoj-app .</verify>
  <done>Soubory existují a docker build proběhne bez chyb.</done>
</task>

<task type="auto">
  <name>Verify container locally</name>
  <files>Dockerfile</files>
  <action>
    - Spustit kontejner lokálně: docker run -d -p 8080:80 propoj-app.
    - Ověřit, že aplikace je dostupná na localhost:8080.
    - Zkontrolovat, že funguje routing (např. ruční zadání /admin v URL).
  </action>
  <verify>curl -I http://localhost:8080</verify>
  <done>Aplikace běží v kontejneru a SPA routing funguje.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Docker image je vytvořen a má rozumnou velikost (<100MB).
- [ ] Aplikace se v kontejneru načte a připojí k Appwrite (vyžaduje správné ENV).
</verification>

<success_criteria>
- [ ] Dockerfile je připraven pro produkční nasazení.
- [ ] SPA routing je v Nginxu správně nakonfigurován.
</success_criteria>
