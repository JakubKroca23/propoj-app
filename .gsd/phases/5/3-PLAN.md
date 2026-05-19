---
phase: 5
plan: 3
wave: 2
---

# Plan 5.3: Dockerizace & Self-hosting

## Objective
Připravit produkční Docker prostředí pro snadné nasazení a self-hosting celého systému Canvas OS za reverzní proxy Traefik na vlastní subdoméně `propoj.app`, a vytvořit komplexního self-host průvodce v `README.md`.

## Context
- [.gsd/SPEC.md](file:///home/jakub/github/propoj-app/.gsd/SPEC.md) (REQ-20)
- [.gsd/DECISIONS.md](file:///home/jakub/github/propoj-app/.gsd/DECISIONS.md) (Fáze 5 Rozhodnutí)

## Tasks

<task type="auto">
  <name>Docker konfigurace pro produkční běh</name>
  <files>
    <file>Dockerfile</file>
    <file>docker-compose.yml</file>
    <file>nginx.conf</file>
  </files>
  <action>
    1. Vytvořit produkční `Dockerfile`:
       - Multi-stage sestavení: první stage (Node.js) spustí `npm install` a `npm run build`; druhá stage (Nginx Alpine) zkopíruje hotové statické soubory z `dist/` do `/usr/share/nginx/html`.
    2. Vytvořit `nginx.conf` pro správné routování:
       - Nastavit SPA routing fallback (`try_files $uri $uri/ /index.html`), caching pravidla pro assety a podporu gzip komprese.
    3. Vytvořit `docker-compose.yml`:
       - Definovat službu `frontend` s buildem z aktuálního adresáře.
       - Přidat konfiguraci pro síť Traefika (`networks: traefik-public` / `external: true`).
       - Nastavit potřebné Traefik labely pro routing domény `propoj.app` s automatickou správou SSL certifikátů přes Let's Encrypt.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Docker soubory jsou vytvořeny, jsou typově bezpečné, a konfigurace Nginxu správně obsluhuje klientský React SPA routing.
  </done>
</task>

<task type="auto">
  <name>Self-hosting dokumentace a finální verifikace</name>
  <files>
    <file>README.md</file>
  </files>
  <action>
    1. Kompletně přepsat/aktualizovat `README.md` v češtině:
       - Přehledný úvod do Canvas OS, představení všech 9 core aplikací a plugin systému.
       - Podrobný průvodce pro lokální vývoj (`npm run dev`).
       - Návod na self-hosting přes Docker a Traefik.
       - Popis integrace s Appwrite databází a bucketem pro soubory.
       - Návod na spuštění e-mailového klienta (proxy Node.js funkce) a počasí.
    2. Provést závěrečnou kontrolu celého systému (`npx tsc --noEmit` a `npm run build`).
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    README.md obsahuje vyčerpávající a jasně srozumitelnou dokumentaci a celý projekt se zkompiluje a úspěšně sestaví do produkčního balíku.
  </done>
</task>

## Success Criteria
- [ ] V kořeni projektu existují `Dockerfile`, `docker-compose.yml` a `nginx.conf` pro produkční nasazení.
- [ ] Docker konfigurace podporuje Traefik reverse proxy a interní docker síťování.
- [ ] `README.md` je plně aktualizován a obsahuje detailní návod k self-hostingu a nastavení systému.
- [ ] Produkční sestavení (`npm run build`) proběhne úspěšně a bez chyb.
