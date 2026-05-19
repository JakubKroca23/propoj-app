# STACK.md — Technologický inventář Canvas OS

> **Aktualizováno**: 2026-05-19
> **Verze**: v1.0-alpha (Po dokončení Fáze 2)
> **Jazyk**: Čeština

Tento dokument mapuje technologie, knihovny, verze a infrastrukturu použité v projektu **propoj.app — Canvas OS**.

---

## 1. Jádro a Runtime

| Technologie | Verze | Účel |
|-------------|-------|------|
| **Node.js** | >= 18.x | Runtime pro vývoj a build nástroje |
| **Vite** | ^6.3.5 | Rychlý bundler a dev server |
| **React** | ^19.1.0 | UI knihovna pro tvorbu komponent |
| **TypeScript** | ~5.8.3 | Statická typová kontrola kódu |

---

## 2. Produkční závislosti (Dependencies)

Tyto knihovny jsou zabaleny do finálního produkčního buildu aplikace.

| Balíček | Verze | Účel |
|---------|-------|------|
| **`appwrite`** | `^25.1.1` | Appwrite Client Web SDK pro komunikaci s backendem |
| **`zustand`** | `^5.0.13` | Odlehčený a rychlý stavový manažer pro globální OS state |
| **`@use-gesture/react`** | `^10.3.1` | Správa komplexních gest (drag & drop, resize, zoom) |
| **`react-dom`** | `^19.1.0` | Vykreslovací engine pro React na webu |

---

## 3. Vývojové závislosti (Dev Dependencies)

Nástroje používané výhradně během vývoje pro zajištění kvality kódu, lintování a sestavování.

| Balíček | Verze | Účel |
|---------|-------|------|
| **`vite`** | `^6.3.5` | Sestavování a hot-module reloading |
| **`typescript`** | `~5.8.3` | Překladač TypeScriptu do JavaScriptu |
| **`eslint`** | `^9.25.0` | Statická analýza a vynucování kvality kódu |
| **`typescript-eslint`** | `^8.30.1` | Podpora TypeScriptu v ESLintu |
| **`@vitejs/plugin-react`** | `^4.4.1` | Oficiální React plugin pro rychlý Vite build |

---

## 4. Backend & Infrastruktura

Canvas OS využívá výhradně backend typu **BaaS (Backend as a Service)** zajištěný platformou **Appwrite**.

| Služba / Komponenta | Poskytovatel | Použití |
|---------------------|--------------|---------|
| **Appwrite Cloud/Server** | `appwrite.propoj.app` | Hostovaný self-hosted backend běžící na subdoméně |
| **Appwrite Authentication** | Appwrite Auth | Autentizace uživatelů přes jméno/heslo |
| **Appwrite Database** | Appwrite Databases | Perzistentní úložiště pro pluginy a uživatelské layouty |
| **Appwrite Storage** | Appwrite Bucket | Úložiště souborů pro chystaného Správce souborů |
| **Appwrite Functions** | Appwrite Functions | Serverless funkce pro proxy a IMAP integraci (Fáze 4) |

---

## 5. Databázové Schéma (Kolekce)

V Appwrite databázi `canvas-os` jsou vytvořeny následující kolekce:

### A. Kolekce `plugins`
Slouží jako registr dostupných aplikací a pluginů.
- **`name`** (string, required): Název aplikace (např. `"Kalkulačka"`).
- **`description`** (string): Popis pluginu a jeho schopností.
- **`url`** (string, required): Cílová URL adresa iframe aplikace (např. `/plugins/calculator/index.html`).
- **`icon`** (string): SVG ikona nebo název ikony pro zobrazení v Bento launcheru.
- **`permissions`** (string, array): Seznam oprávnění, o která plugin žádá (např. `["storage"]`).
- **`enabled`** (boolean, default: `true`): Zda je plugin globálně povolen v systému.

### B. Kolekce `user_preferences`
Ukládá individuální konfigurace a nastavení uživatelů.
- **`userId`** (string, required): Identifikátor přihlášeného uživatele v Appwrite.
- **`gridLayout`** (string, required): Serializovaný JSON obsahující uspořádání kachliček a stav na Bento ploše.

---

## 6. Konfigurace prostředí (.env)

Systém využívá lokální `.env` soubor pro definici připojení k backendu:

| Proměnná | Účel | Příklad hodnoty |
|----------|------|-----------------|
| `VITE_APPWRITE_ENDPOINT` | URL adresa Appwrite API | `https://appwrite.propoj.app/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Identifikátor projektu | `69effdf6003ce697ee83` |
| `VITE_APPWRITE_DATABASE_ID` | Název/ID databáze | `canvas-os` |
