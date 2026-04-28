---
phase: 3
plan: 2
wave: 2
depends_on: ["3.1"]
files_modified: ["sidecar/index.ts", "sidecar/middleware/auth.ts", "sidecar/routes/stats.ts"]
autonomous: true
---

# Plan 3.2: Sidecar API Logic & Security

<objective>
Implementace logiky pro sběr statistik z Dockeru a zabezpečení API pomocí Appwrite JWT.
</objective>

<context>
- .gsd/phases/3/RESEARCH.md
- sidecar/index.ts
</context>

<tasks>

<task type="auto">
  <name>Implement Appwrite Auth Middleware</name>
  <files>sidecar/middleware/auth.ts</files>
  <action>
    Vytvořit middleware, který:
    1. Extrahuje JWT z `Authorization: Bearer <jwt>` headeru.
    2. Použije `node-appwrite` SDK (`client.setJWT(jwt)`) k ověření uživatele.
    3. Volá `account.get()` pro získání detailů uživatele.
    4. Ověří, zda `user.$id` odpovídá `ADMIN_USER_ID` z env.
    AVOID: Používání API Key pro verifikaci JWT, SDK to zvládá nativně přes `.setJWT()`.
  </action>
  <verify>Unit test middleware nebo curl s neplatným/chybějícím tokenem (očekáváno 401/403).</verify>
  <done>Middleware úspěšně blokuje neautorizované požadavky.</done>
</task>

<task type="auto">
  <name>Implement Stats Endpoint</name>
  <files>sidecar/routes/stats.ts, sidecar/index.ts</files>
  <action>
    Implementovat GET `/api/stats` endpoint:
    1. Použít `dockerode` k získání seznamu všech kontejnerů (`listContainers`).
    2. Pro každý kontejner získat real-time statistiky (`container.stats({stream: false})`).
    3. Transformovat data na jednoduchý JSON: `[{ name, status, cpu_percent, memory_usage, memory_limit }]`.
    4. Ošetřit chyby při čtení ze socketu.
  </action>
  <verify>Volání `curl http://localhost:3001/api/stats` s platným tokenem vrací JSON data.</verify>
  <done>Endpoint vrací aktuální statistiky kontejnerů.</done>
</task>

</tasks>

<verification>
- [ ] API vrací reálná data z Dockeru.
- [ ] API je chráněno proti neautorizovanému přístupu.
</verification>

<success_criteria>
- [ ] Sidecar API je plně funkční a zabezpečené.
</success_criteria>
