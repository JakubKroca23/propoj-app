# RESEARCH.md — Phase 3: Sidecar Monitoring & Admin Dashboard

## Objective
Implementace Sidecar API pro sběr Docker statistik a vytvoření zabezpečeného administrátorského dashboardu pro vizualizaci stavu serveru a správu projektů.

## Sidecar API Architecture
Pro bezpečný a lehký sběr dat o kontejnerech využijeme Node.js Express server běžící v samostatném kontejneru (sidecar).

### Technical Stack
- **Runtime**: Node.js 20 (ARM64 optimalizováno).
- **Library**: `dockerode` pro interakci s Docker Engine API přes `/var/run/docker.sock`.
- **Framework**: Express.js pro REST API.
- **Security**: 
    - Verifikace Appwrite JWT přes Appwrite Server SDK (`node-appwrite`).
    - Kontrola User ID proti povolenému administrátorovi (`ADMIN_USER_ID` v env).
    - API přístupné pouze přes HTTPS (Traefik) na subdoméně `api.propoj.app`.

### Data Collection
Sidecar bude sbírat následující metriky pro každý kontejner:
- `Name`: Jméno kontejneru.
- `State`: Aktuální stav (running, exited, atd.).
- `CPU %`: Využití procesoru.
- `Memory`: Využití RAM a limity.
- `Uptime`: Doba běhu.

## Admin Dashboard (admin.propoj.app)
Dashboard bude integrován do stávající React aplikace, ale chráněn Guardem.

### UX/UI Design
- **JARVIS Aesthetics**: Pokračování v dark mode/HUD stylu.
- **Real-time Updates**: Spolling nebo WebSockety pro živý monitoring (zpočátku polling každých 5s).
- **Project Management**: CRUD operace pro projekty v Appwrite databázi (pokud nebude stačit Appwrite Console).

### Authentication Flow
1. Uživatel se přihlásí na `propoj.app/login` přes Appwrite Auth.
2. Frontend získá JWT (`account.createJWT()`).
3. Frontend volá Sidecar API s JWT v `Authorization` headeru.
4. Sidecar API ověří JWT a vrátí data.

## Implementation Risks
- **ARM64 Compatibility**: Nutnost použít správné base images pro Node.js a Docker CLI.
- **Security**: Expozice `/var/run/docker.sock` vyžaduje opatrnost (readonly přístup není přes socket možný, ale API omezíme pouze na GET stats).
- **Latency**: Polling může zatěžovat server, nutno optimalizovat frekvenci.

## Recommendations
1. Použít `dockerode` pro čistý přístup k socketu.
2. Implementovat middleware v Expressu pro validaci Appwrite JWT.
3. Použít `ADMIN_USER_ID` env proměnnou pro whitelistování jediného uživatele.
