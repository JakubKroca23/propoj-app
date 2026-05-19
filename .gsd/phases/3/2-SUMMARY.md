# Summary — Plan 3.2: Úložiště a Prohlížení dokumentů (Soubory & PDF Viewer)

## Objective
Implementovat aplikaci **Správce souborů** s Google Drive-style strukturou virtuálních složek na základě custom metadat, nahráváním souborů s live progress barem a ošetřením limitu 10MB do Appwrite Storage. Zároveň vytvořit **PDF Prohlížeč** s integrací automatického spouštění po kliknutí na PDF soubory a možností printu a downloadu.

## Co bylo implementováno

### 1. Aplikace Správce souborů (`src/apps/FileManager/`)
- **FileManager.tsx**:
  - Breadcrumbs navigace s odkazem na nadřazené složky (`Domů > Složka > Podsložka`).
  - Google Drive-style grid mřížka a přepínač na tabulkový seznam (List View) se sloupci (Název, Velikost, Datum nahrání).
  - Virtuální složkový systém (ukládání složek kódováním prefixu `složka___soubor` do názvu souboru, abychom obešli ploché API Appwrite Storage a umožnili hierarchickou navigaci).
  - Nahrávání s live progress barem a callbackem `onProgress` napojeným na typově bezpečný `progress.progress` z Appwrite SDK.
  - Omezení velikosti nahrávaného souboru na 10MB s chybovým bannerem v UI.
  - Stažení, mazání souborů a inline lightbox preview pro obrázky (`.png`, `.jpg`, `.gif`) a videa (`.mp4`, `.webm`) bez nutnosti opouštět okno.
  - Automatické spuštění `pdf-viewer` aplikace s předáním parametrů (`fileUrl`, `fileName`) při kliknutí na soubor `.pdf`.
- **FileManager.css**:
  - Plnohodnotný glassmorphic design s průsvitným rozostřeným pozadím a elegantními hover animacemi.
  - Responzivní grid a tabulka se zalamováním dlouhých názvů.

### 2. Aplikace PDF Prohlížeč (`src/apps/PdfViewer/`)
- **PdfViewer.tsx**:
  - Podpora přímého zobrazení PDF souboru pomocí inline `<iframe>` s parametrem `#toolbar=1` pro zobrazení výchozích ovládacích prvků prohlížeče.
  - Horní panel s názvem dokumentu a funkčními tlačítky (Tisk, Stažení, Zavřít).
  - Elegantní prázdný stav (Blank State) s animovanou grafikou a tlačítkem „Vybrat PDF ze souborů“, které otevře interaktivní glassmorphic dialog. Tento dialog vyfiltruje a nabídne k výběru pouze soubory s příponou `.pdf` z Appwrite Storage.
- **PdfViewer.css**:
  - Podpora tmavého i světlého režimu.
  - Animovaný dialog pro výběr souborů s hladkým transition efektem na hoveru.

## Ověření a Verifikace
Spuštění lokální typové kontroly a produkčního sestavení:
```bash
npm run build
```
Všechny typy i bundler (Vite) proběhly bez chyb. PDF Viewer spouští nativní rozhraní iframe a korektně integruje parametry oken.
