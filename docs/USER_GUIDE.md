# 📘 Uživatelská příručka k systému Canvas OS

Vítejte v podrobné uživatelské příručce pro **Canvas OS** (propoj.app). Tato dokumentace slouží jako kompletní průvodce pro běžné uživatele, vývojáře a administrátory, kteří chtějí naplno využít potenciál tohoto webového operačního systému.

---

## 🧭 Globální ovládání & Shell

Canvas OS přináší zážitek z desktopového operačního systému přímo do vašeho webového prohlížeče. Celé prostředí je postaveno na dynamické ploše typu **Bento Grid**.

### 1. Bento Grid Launcher (Plocha)
Plocha je tvořena bento kachličkami, které slouží jako spouštěče aplikací a živé widgety:
*   **Živé widgety**: Přímo na ploše vidíte aktuální čas/datum, widget s geolokačním počasím, widget s nadcházejícími úkoly a posledními nahranými soubory.
*   **Aktivní interakce**: Každá kachlička reaguje na najetí myši 3D rotací, zvětšením a zářící barevnou aurou odpovídající barvě dané aplikace.

### 2. Window Manager (Správce oken)
Aplikace se otevírají ve formě plovoucích oken:
*   **Přesun a změna velikosti**: Okna lze libovolně přesouvat tažením za záhlaví a měnit jejich velikost tažením za pravý dolní roh.
*   **Maximalizace a minimalizace**: Okno lze zvětšit na celou obrazovku, dočasně schovat na spodní Taskbar nebo zcela zavřít.
*   **Aktivní ostření (Focus)**: Kliknutím na jakoukoliv část okna se okno přesune do popředí (zvýší se jeho `zIndex`). Systém má zabudovanou ochranu proti proklikům skrz iframy.

### 3. Universal Command Bar (`Ctrl + K`)
Globální vyhledávací panel přístupný odkudkoliv stisknutím klávesové zkratky `Ctrl + K`:
*   **Spotlight hledání**: Umožňuje okamžitě prohledávat soubory, poznámky, úkoly a kalendář napříč celým systémem.
*   **Rychlé příkazy**: Zadáním konkrétních prefixů můžete spouštět akce s parametry:
    *   `/f {název}` — otevře Správce souborů a vyhledá soubor.
    *   `/n {text}` — okamžitě vytvoří novou poznámku s tímto textem.
    *   `/t {úkol}` — přidá nový úkol do Kanban listu.
    *   `/c` — otevře Kalendář.
    *   `/a {aplikace}` — spustí zvolenou aplikaci z registru.

### 4. Workspaces (Virtuální plochy)
Spodní lišta obsahuje přepínač virtuálních ploch (např. *Osobní*, *Práce*, *Finance*, *Vývoj*). Každý workspace udržuje svou vlastní sadu otevřených oken. Přepínání mezi nimi je doprovázeno plynulým fade-in efektem a pomáhá udržovat pořádek při práci na více projektech zároveň.

---

## 📱 Podrobný přehled 10 core aplikací

Canvas OS obsahuje v základu 10 plnohodnotných aplikací navržených pro maximalizaci produktivity.

### 1. 📁 Soubory (FileManager)
Virtuální disk plně synchronizovaný s **Appwrite Storage** a databází:
*   **Struktura složek**: Podporuje neomezené vytváření složek, podsložek a procházení stromovou strukturou.
*   **Nahrávání a stahování**: Umožňuje upload libovolných souborů do velikosti 10 MB s vizuálním průběhem (Progress bar) v reálném čase.
*   **Lightbox & Preview**: Integrovaný prohlížeč pro obrázky, audio přehrávač, video přehrávač a textové náhledy.

### 2. 📝 Poznámky (Notes)
Profesionální textový editor postavený na frameworku **Tiptap**:
*   **Rich-text editace**: Podpora formátování (nadpisy, tučné, kurzíva, seznamy, citace, bloky kódu).
*   **Auto-save**: Poznámky se automaticky ukládají do Appwrite databáze každých 800 ms od poslední změny.
*   **Kategorizace**: Možnost přidávat barevné štítky (tagy) a fulltextově vyhledávat v obsahu všech poznámek.

### 3. 📅 Kalendář (Calendar)
Plánovací nástroj pro sledování událostí:
*   **Gridové pohledy**: Přepínání mezi měsíčním, týdenním a denním zobrazením.
*   **Správa událostí**: Snadné vytváření událostí kliknutím na den, definice času, popisu a barevné kategorie.
*   **Drag & Drop**: Události lze přesouvat mezi dny jednoduchým přetažením myši.

### 4. ✅ Úkoly (Tasks)
Hybridní task manager pro organizaci práce:
*   **Kanban Board**: Sloupce *K udělání*, *V procesu* a *Hotovo*.
*   **Nativní HTML5 Drag & Drop**: Přetahování úkolů mezi sloupci s okamžitou synchronizací a optimistickými UI updaty pro nulovou odezvu.
*   **Vlastnosti**: Nastavení priority (nízká, střední, vysoká), termínu dokončení (duedate) a štítků.

### 5. 💰 Finance (Finance Manager)
Osobní účetnictví pro sledování rozpočtu:
*   **Transakce**: Záznam příjmů a výdajů s přiřazením kategorie, data a popisu.
*   **Analytické grafy**: Vizualizace příjmů/výdajů v čase a podílu kategorií pomocí interaktivních koláčových a sloupcových grafů.
*   **Statistiky**: Okamžitý přehled čistého měsíčního zisku a celkového zůstatku.

### 6. 📧 Email (Email Client)
Emailový klient integrovaný s libovolným IMAP/SMTP serverem:
*   **Bezpečné proxy**: Komunikace probíhá šifrovaně přes Appwrite Functions, která funguje jako proxy (ochrana přihlašovacích údajů).
*   **Inbox a složky**: Prohlížení doručené pošty, detailní čtení emailů včetně HTML obsahu.
*   **Compose**: Psaní a odesílání nových zpráv s možností bohatého textu.

### 7. 🌤 Počasí (Weather)
Meteo widget napojený na **OpenWeatherMap API**:
*   **Geolokace**: Automaticky detekuje polohu uživatele nebo umožňuje ruční vyhledání města.
*   **Předpověď**: Zobrazuje aktuální teplotu, povětrnostní podmínky, vlhkost vzduchu a 5denní detailní předpověď.

### 8. 📕 PDF Prohlížeč (PDF Viewer)
Integrovaný handler pro otevírání dokumentů:
*   **Inline čtečka**: Otevírá PDF soubory přímo z virtuálního správce souborů bez nutnosti stahování do lokálního počítače.
*   **Nástroje**: Podpora zoomování, rotace, vyhledávání v textu a přímého tisku.

### 9. ⚙️ Nastavení (Settings)
Administrační panel systému:
*   **Správa profilu**: Změna uživatelského jména, hesla a nahrání profilového obrázku.
*   **Vzhled**: Přepínání Dark / Light mode (systém plně respektuje nastavení vašeho operačního systému, pokud zvolíte možnost auto).
*   **Správa pluginů**: Aktivace/deaktivace a správa oprávnění pro externí pluginy.

### 10. ⚔️ Strategie (RTS Hra)
Tématická strategická hra „Sabotáž v Montáži s.r.o.“:
*   **Mechanika**: Sbírejte ocel s vozidly **Šasi**, stavte rozestavěné budovy pomocí **Jeřábů** a montujte bojové **Nakladače** a **Hasiče** pro obranu své Hlavní dílny před nájezdy porouchaných aut konkurenční firmy.
*   **Appwrite Leaderboard**: Po zničení vaší dílny se vaše skóre, přežité vlny a čas hry zapíší do síně slávy.

---

## 🔌 Architektura pluginů (Extensibilitity)

Canvas OS obsahuje pokročilý plugin engine, který umožňuje komunitě rozšiřovat systém o nové aplikace bez modifikace zdrojového kódu jádra.

### 1. Iframe Sandboxing
Každý plugin běží v izolovaném HTML5 `<iframe>` elementu s přísným sandbox nastavením (`sandbox="allow-scripts allow-forms allow-popups"`). Tím je zajištěno, že škodlivý plugin nemůže ukrást session tokeny nebo manipulovat s cookies hlavního OS.

### 2. Komunikační Bridge (postMessage)
Pluginy komunikují s jádrem OS asynchronně přes zabezpečený kanál `window.postMessage`. 
Při spuštění obdrží plugin v parametru URL náhodně vygenerovaný kryptografický UUID token. Každá zpráva zaslaná do OS musí tento token obsahovat, jinak je okamžitě zahozena.

### 3. Manifest struktura
Každý plugin je uložen v Appwrite Storage jako ZIP archiv obsahující:
*   `manifest.json`: definuje ID, název, verzi, ikonu, vstupní bod (`index.html`) a požadovaná oprávnění (`storage`, `files`, `calendar`, `network`).
*   `index.html`: hlavní uživatelské rozhraní.
*   Statické assety (JS, CSS, obrázky).

---

## 🐳 Správa a Self-hosting (Pro administrátory)

### Produkční prostředí
Canvas OS je plně připraven pro orchestraci přes **Docker Compose** a reverzní proxy **Traefik** s automatickým zabezpečením SSL přes Let's Encrypt.

#### Porty a sítě:
*   Frontend (Nginx) naslouchá interně na portu `80`.
*   Traefik labels provádějí automatický forwarding a přesměrování z HTTP na HTTPS.
*   Aplikace komunikuje s Appwrite přes sdílenou docker síť `appwrite`.

#### Bezpečnostní hlavičky (Nginx):
Systém vynucuje přísnou bezpečnost prostřednictvím hlaviček:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';" always;
```
 Tím je zaručeno, že systém nelze zneužít k útokům typu Clickjacking nebo XSS.
