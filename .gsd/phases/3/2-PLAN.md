---
phase: 3
plan: 2
wave: 3
---

# Plan 3.2: Úložiště a Prohlížení dokumentů (Soubory & PDF Viewer)

## Objective
Implementovat aplikaci **Správce souborů** s Google Drive-style strukturou virtuálních složek, nahráváním souborů s progress barem do Appwrite Storage a inline lightbox preview pro obrázky/video. Zároveň vytvořit **PDF Prohlížeč** s integrací automatického spouštění po kliknutí na PDF soubory.

## Context
- [.gsd/SPEC.md](file:///.gsd/SPEC.md)
- [.gsd/phases/3/RESEARCH.md](file:///.gsd/phases/3/RESEARCH.md)
- [src/lib/appwrite.ts](file:///home/jakub/github/propoj-app/src/lib/appwrite.ts)
- [src/stores/windowStore.ts](file:///home/jakub/github/propoj-app/src/stores/windowStore.ts)

## Tasks

<task type="auto">
  <name>Správce souborů s Google Drive strukturou a upload bary</name>
  <files>
    src/apps/FileManager/FileManager.tsx
    src/apps/FileManager/FileManager.css
  </files>
  <action>
    1. Vytvoř složku `src/apps/FileManager` a soubory `FileManager.tsx` a `FileManager.css`.
    2. Navrhni Google Drive-style uživatelské rozhraní:
       - Horní panel: Breadcrumbs cesta s odkazem na nadřazené složky (např. `Domů > Práce > Dokumenty`), tlačítko "Vytvořit složku", tlačítko "Nahrát soubor" (s `input type="file"`).
       - Hlavní plocha: Mřížka (grid) složek (oranžové/žluté ikony) a souborů (ikona se liší podle přípony: `.png`, `.jpg`, `.pdf`, `.mp4` atd.).
       - Možnost přepnout na Seznam (List View) se sloupci (název, velikost, datum nahrání).
    3. Virtuální složkový systém:
       - Ve složkách se naviguje kliknutím (double click / single click).
       - Nová složka vytvoří virtuální záznam (cesta se ukládá do custom metadata atributů nahrávaných souborů, abychom obešli plochou strukturu Appwrite Storage).
    4. Integrace Appwrite Storage:
       - Funkce nahrávání souborů s live progress barem pomocí `storage.createFile` a callbacku `onProgress`.
       - Mazání souborů a stažení souboru.
       - Kontrola limitu velikosti souboru (např. 10MB) s vizuálním varováním.
    5. Handlery a Lightbox Previews:
       - Kliknutí na obrázek (`.png`, `.jpg`, `.gif`) nebo video (`.mp4`, `.webm`) otevře elegantní glassmorphic lightbox preview přímo uvnitř okna FileManageru.
       - Kliknutí na soubor `.pdf` automaticky vyvolá spuštění aplikace `pdf-viewer` s předáním cesty souboru v `win.params?.fileUrl` a `fileName`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Správce souborů se bezchybně kompiluje, umožňuje nahrávat a stahovat soubory přes Appwrite, procházet složky a spouští lightbox i PDF prohlížeč.</done>
</task>

<task type="auto">
  <name>PDF Prohlížeč s tiskem a otevíráním souborů</name>
  <files>
    src/apps/PdfViewer/PdfViewer.tsx
    src/apps/PdfViewer/PdfViewer.css
  </files>
  <action>
    1. Vytvoř složku `src/apps/PdfViewer` a soubory `PdfViewer.tsx` a `PdfViewer.css`.
    2. Vytvoř layout:
       - Horní panel: Název zobrazeného souboru, ovládací prvky (tlačítko "Zavřít dokument", "Stáhnout", "Vytisknout").
       - Hlavní plocha: Bezpečný `<embed src={fileUrl} type="application/pdf" width="100%" height="100%" />` nebo `<iframe>` pro zobrazení PDF souboru.
    3. Zpracování parametrů:
       - Pokud aplikace obdrží `win.params?.fileUrl`, ihned dokument vykresli a zobraz jeho název.
       - Pokud se aplikace spustí prázdná (kliknutím na ikonu z launcheru), zobraz elegantní glassmorphic placeholder s tlačítkem „Vybrat PDF ze souborů“, které otevře zjednodušený FileManager modal a umožní uživateli vybrat soubor k zobrazení.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>PDF Prohlížeč se správně kompiluje, bezpečně zobrazuje PDF dokumenty, podporuje integraci parametrů a poskytuje elegantní prázdný stav s výběrem souborů.</done>
</task>

## Success Criteria
- [ ] Správce souborů komunikuje se Storage bucketem v Appwrite a zobrazuje progress bary u nahrávání.
- [ ] Virtuální navigace složkami funguje správně na základě metadat.
- [ ] PDF Prohlížeč se automaticky otevírá po kliknutí na PDF ve Správci souborů a zobrazuje dokument.
- [ ] TypeScript kompilace je bezchybná.
