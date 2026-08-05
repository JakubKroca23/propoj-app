# Dopamine Arena

Next.js herní aréna (Crash, Mines, Dice, Slots, Plinko) s Appwrite synchronizací zůstatku a live feedu.

## Lokální vývoj

```bash
cp .env.example .env.local
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

Bez Appwrite tabulek appka běží v offline módu (anonymní session + lokální zůstatek).

## Appwrite setup

V `.env.local` nastav `API_KEY` a public Appwrite proměnné, pak:

```bash
npm run setup:appwrite
```

Skript idempotentně vytvoří:
- Database `dopamine_arena`
- Table `players` (`userId`, `displayName`, `balance`)
- Table `bets` (`userId`, `displayName`, `game`, `bet`, `multi`, `payout`, `isWin`)

Anonymous auth musí být zapnuté v konzoli (u `propoj-app` už je).
Platformy: přidej `localhost` / `propoj.app` pokud chybí.

## Docker deploy

Na serveru ve stejné Docker network `appwrite` (Traefik):

```bash
docker compose up -d --build
```

Traefik routuje `propoj.app` / `www.propoj.app` na container port **3000** (Next.js standalone).

Healthcheck: `GET /api/health`
