# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.propoj.app/v1
ARG NEXT_PUBLIC_APPWRITE_PROJECT_ID=propoj-app
ARG NEXT_PUBLIC_APPWRITE_DATABASE_ID=dopamine_arena
ARG NEXT_PUBLIC_APPWRITE_PLAYERS_TABLE_ID=players
ARG NEXT_PUBLIC_APPWRITE_BETS_TABLE_ID=bets

ENV NEXT_PUBLIC_APPWRITE_ENDPOINT=$NEXT_PUBLIC_APPWRITE_ENDPOINT
ENV NEXT_PUBLIC_APPWRITE_PROJECT_ID=$NEXT_PUBLIC_APPWRITE_PROJECT_ID
ENV NEXT_PUBLIC_APPWRITE_DATABASE_ID=$NEXT_PUBLIC_APPWRITE_DATABASE_ID
ENV NEXT_PUBLIC_APPWRITE_PLAYERS_TABLE_ID=$NEXT_PUBLIC_APPWRITE_PLAYERS_TABLE_ID
ENV NEXT_PUBLIC_APPWRITE_BETS_TABLE_ID=$NEXT_PUBLIC_APPWRITE_BETS_TABLE_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
