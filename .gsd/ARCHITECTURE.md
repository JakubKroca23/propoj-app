# ARCHITECTURE.md

## Overview
Propoj-app je moderní webový portál postavený na Reactu s backendem v Appwrite. Systém je navržen s důrazem na vizuální kvalitu (JARVIS HUD) a bezpečný monitoring infrastruktury.

## Components

### 1. Frontend (React + Vite)
- **UI Logic**: Framer Motion pro komplexní HUD animace.
- **State Management**: React Context API pro Auth a Appwrite sessions.
- **Styling**: Tailwind CSS s custom cyber-paletou.

### 2. Sidecar Service (Node.js)
- **Purpose**: Bezpečný monitoring Dockeru.
- **Security**: Appwrite Server SDK verifikace JWT + admin whitelist.
- **API**: `/api/stats` pro real-time metriky (CPU/RAM).

### 3. Backend (Appwrite)
- **Auth**: Správa uživatelů a sessions.
- **Database**: Kolekce `projects` (portfolio) a `messages` (kontakty).
- **Storage**: Správa mediálních souborů a preview obrázků.

## Infrastructure
- **Deployment**: Docker Compose (ARM64 optimalizace).
- **Proxy**: Traefik (předpokládaný pro produkci).
- **Monitoring**: Přímý přístup k `docker.sock` přes sidecar.

---
> Last updated: 2026-04-28 (v1.0 Completion)
