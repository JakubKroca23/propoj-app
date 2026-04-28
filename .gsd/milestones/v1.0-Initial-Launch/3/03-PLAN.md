---
phase: 3
plan: 3
wave: 3
depends_on: ["3.2"]
files_modified: ["src/pages/Admin.tsx", "src/components/AdminGuard.tsx", "src/App.tsx", "src/api/sidecar.ts"]
autonomous: true
---

# Plan 3.3: Admin Dashboard UI

<objective>
Vytvoření administrátorského rozhraní v React aplikaci pro vizualizaci statistik a správu.
</objective>

<context>
- .gsd/SPEC.md
- src/App.tsx
- sidecar/routes/stats.ts
</context>

<tasks>

<task type="auto">
  <name>Implement Admin Guard & API Client</name>
  <files>src/components/AdminGuard.tsx, src/api/sidecar.ts</files>
  <action>
    - `AdminGuard.tsx`: Komponenta vyššího řádu nebo wrapper, který kontroluje Appwrite session. Pokud není admin přihlášen, přesměruje na login.
    - `sidecar.ts`: Axios/Fetch klient, který automaticky generuje JWT přes `account.createJWT()` a přidává jej do headeru požadavků na Sidecar API.
  </action>
  <verify>Navigace na `/admin` bez přihlášení by měla přesměrovat pryč.</verify>
  <done>Přístup k adminu je chráněn na frontendu i v API voláních.</done>
</task>

<task type="auto">
  <name>Build Admin Dashboard Page</name>
  <files>src/pages/Admin.tsx, src/App.tsx</files>
  <action>
    Vytvořit stránku `/admin` s JARVIS/HUD designem:
    - Seznam kontejnerů s barevnými indikátory stavu (zelená/červená).
    - Vizualizace CPU a RAM (např. progress bary nebo malé grafy).
    - Tlačítko pro manuální refresh dat.
    - Integrovat do React Routeru v `App.tsx`.
  </action>
  <verify>Zobrazení reálných dat z Dockeru na stránce `/admin`.</verify>
  <done>Administrátor vidí aktuální stav serveru v přehledném HUD rozhraní.</done>
</task>

</tasks>

<verification>
- [ ] Admin dashboard zobrazuje správná data.
- [ ] UI odpovídá JARVIS estetice.
</verification>

<success_criteria>
- [ ] Fáze 3 je kompletní a připravena k nasazení.
</success_criteria>
