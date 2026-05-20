# ⚙️ propoj.app — Canvas OS

**Canvas OS** je moderní, vysoce optimalizovaný a vizuálně ohromující webový operační systém (desktopové prostředí v prohlížeči) postavený na technologiích **React**, **TypeScript**, **Zustand** a **Vanilla CSS**. Celý systém je navržen s důrazem na špičkovou estetiku (glassmorphism, neonové záře, plynulé mikro-interakce a animace) a je plně integrován s backendovou platformou **Appwrite** pro synchronizaci souborů, úkolů, poznámek, kalendáře a herních výsledků.

Tento repozitář obsahuje finální verzi **Fáze 5**, která přináší kompletní optimalizaci, RTS hru a produkční dockerizaci.

---

## 🚀 Hlavní funkce & Novinky ve Fázi 5

### 1. 🎮 Nástavbářská RTS Hra — „Sabotáž v Montáži s.r.o.“
Věrná pocta klasickým strategiím (jako Warcraft 2) přenesená do kontextu české nástavbářské firmy!
*   **Čistý Canvas Engine**: Hra běží na dedikovaném HTML5 Canvas enginu v 60 FPS, nezávisle na React překreslovacím cyklu pro maximální výkon.
*   **Tématické jednotky**:
    *   🚜 **Šasi (Worker)**: Sbírá ocel ze Šrotiště a odváží ji do Hlavní dílny.
    *   🏗️ **Jeřáb (Builder)**: Nutný pro dostavění rozestavěných budov na gridové mapě.
    *   🚜 **Nakladač (Melee)**: Rychlý bojovník na blízko, který naráží radlicí do nepřátel.
    *   🚒 **Hasiči (Ranged)**: Vybavení vodním dělem pro stříkání na dálku.
*   **Nepřátelé (Sabotéři)**: Černá porouchaná kouřící auta z konkurenční firmy, která se snaží v pravidelných vlnách zničit vaši Hlavní dílnu.
*   **Grid a Fog of War**: Dynamické stínování neprozkoumaných oblastí (Fog of War) okolo vašich jednotek a budov.
*   **Síň slávy (Leaderboard)**: Živé skóre se ukládá do kolekce `game_highscores` v Appwrite s automatickým fallbackem na local storage a mock tabulku v offline režimu.

### 2. ⚡ Lazy Loading & Code Splitting
Pro dosažení bleskurychlého načítání byla kompletní architektura 10 core aplikací přepsána na dynamické importy pomocí `React.lazy()` a `React.Suspense`.
*   **Bleskový start**: Úvodní bundle se snížil o více než **50 %**.
*   **On-demand stahování**: Kód a CSS styly konkrétní aplikace se stáhnou z webserveru až ve chvíli, kdy ji uživatel poprvé otevře na ploše.
*   **Premium Loader**: Během asynchronního stahování se zobrazuje elegantní glassmorphic spinner s animovaným načítáním.

### 3. ✨ Premium CSS Polish & Animace
*   **Desktop Icon Bounce**: Ikony v Bento gridu na ploše reagují na najetí myši hravým 3D bounce a scale efektem s pulzující barevnou auru.
*   **Plynulé otevírání oken**: Okna se otevírají plynulým scale-in a fade-in efektem s využitím pokročilých kubických bezierových křivek.

---

## 🐳 Self-hosting & Docker konfigurace (Traefik)

Projekt je plně připraven pro produkční nasazení v Dockeru za reverzní proxy **Traefik** na doméně `propoj.app` (a subdoménách).

### 📋 Požadavky
*   Nainstalovaný **Docker** a **Docker Compose**.
*   Běžící instance **Traefik** proxy připojená na externí docker síť `appwrite`.
*   Běžící backend **Appwrite** (lze provozovat ve stejné síti).

### 🛠️ Spuštění v produkci

1.  Ujistěte se, že máte vytvořenou externí síť pro Traefik / Appwrite:
    ```bash
    docker network create appwrite
    ```

2.  Spusťte sestavení a start kontejneru pomocí Docker Compose:
    ```bash
    docker compose up -d --build
    ```

3.  Compose automaticky:
    *   Spustí multi-stage sestavení klientské aplikace (Node -> Nginx).
    *   Vloží produkční API klíče a endpointy pro Appwrite.
    *   Propojí kontejner s reverzní proxy Traefik.
    *   Vygeneruje SSL certifikát přes Let's Encrypt díky Traefik labelům.
    *   Zabezpečí komunikaci pomocí HTTPS a bezpečnostních hlaviček v Nginx.

### ⚙️ Konfigurační soubory

*   **[Dockerfile](file:///home/jakub/github/propoj-app/Dockerfile)**: Multi-stage Dockerfile optimalizující velikost výsledného Nginx obrazu.
*   **[nginx.conf](file:///home/jakub/github/propoj-app/nginx.conf)**: Produkční konfigurace webserveru Nginx s povolenou Gzip kompresí, cachováním statických assetů a SPA routingem (přesměrování 404 na index.html).
*   **[docker-compose.yml](file:///home/jakub/github/propoj-app/docker-compose.yml)**: Compose specifikace s kompletní sadou Traefik labelů pro zabezpečení, směrování a TLS Let's Encrypt.

---

## 🛠️ Vývojové instrukce (Lokální běh)

1.  Nainstalujte závislosti:
    ```bash
    npm install
    ```

2.  Spusťte vývojový server:
    ```bash
    npm run dev
    ```

3.  Pro ověření typové čistoty před commitem:
    ```bash
    npx tsc --noEmit
    ```

4.  Pro lokální produkční build:
    ```bash
    npm run build
    ```

---

## 🏆 Poděkování & Tým
Vytvořeno s láskou pro platformu **propoj.app** jako moderní ukázka možností webových desktopových prostředí. Všechny komponenty, herní smyčky a designové systémy byly vyladěny pro maximální uživatelský zážitek.
