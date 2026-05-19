---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Finance a oživení Bento widgetů

## Objective
Implementovat modul **Finance** pro sledování příjmů/výdajů s vlastním renderingem responsivních React-SVG grafů (nulové závislosti, čistý glassmorphic dark/light design) a plně oživit Bento plocha pomocí live widgetů: digitální Hodiny s vteřinami, přehled úkolů, nedávné soubory z FileManageru a vizuální budget transakční lišta.

## Context
- [.gsd/SPEC.md](file:///home/jakub/github/propoj-app/.gsd/SPEC.md) (REQ-14, REQ-02)
- [.gsd/DECISIONS.md](file:///home/jakub/github/propoj-app/.gsd/DECISIONS.md) (Fáze 4 Rozhodnutí)
- [src/shell/Desktop/Desktop.tsx](file:///home/jakub/github/propoj-app/src/shell/Desktop/Desktop.tsx)
- [src/apps/FileManager/FileManager.tsx](file:///home/jakub/github/propoj-app/src/apps/FileManager/FileManager.tsx)

## Tasks

<task type="auto">
  <name>Datová vrstva Finance a filesStore</name>
  <files>
    <file>src/lib/dbSetup.ts</file>
    <file>src/stores/financeStore.ts</file>
    <file>src/stores/filesStore.ts</file>
  </files>
  <action>
    1. Rozšířit `src/lib/dbSetup.ts`:
       - Definovat a exportovat `COLLECTION_FINANCE = 'finance_transactions'`.
       - V `initializeDatabase()` přidat kontrolní `databases.listDocuments` pro ověření a bootstrap kolekce `finance_transactions`.
    2. Vytvořit Zustand store `src/stores/financeStore.ts`:
       - Definovat typy pro `Transaction` (id, userId, type: 'income' | 'expense', amount, category, date, description).
       - Implementovat akce `loadTransactions(userId)`, `addTransaction(transaction, userId)`, `deleteTransaction(id, userId)`.
       - Přidat asynchronní synchronizaci s Appwrite databází a robustní mock data jako fallback pro offline / vývojové účely.
    3. Vytvořit Zustand store `src/stores/filesStore.ts`:
       - Vyjmout logiku nahrávání a správy souborů ze `FileManager.tsx` a přenést ji do globálního storu pro sdílení dat s widgety.
       - Implementovat akce `loadFiles()`, `uploadFile(file, userId, folderPath)`, `deleteFile(fileId)`, `createFolder(folderName)`.
       - Udržovat seznam souborů v `files` stavu a podporovat mock fallback pro offline chod.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Stores exist, exportují správné typy a akce bez typových a kompilačních chyb.
  </done>
</task>

<task type="auto">
  <name>Aplikace Finance a custom SVG grafy</name>
  <files>
    <file>src/apps/Finance/Finance.tsx</file>
    <file>src/apps/Finance/Finance.css</file>
    <file>src/data/apps.ts</file>
  </files>
  <action>
    1. Vytvořit aplikaci `src/apps/Finance/Finance.tsx` v češtině (cs-CZ):
       - Formulář pro přidání transakce: Typ (Příjem/Výdaj), Částka (Kč), Kategorie (Jídlo, Bydlení, Zábava, Plat, Služby, Ostatní), Popis, Datum.
       - Výpis transakcí v přehledné tabulce s možností mazání a filtrací podle typu, měsíce a kategorií.
       - Custom responsivní SVG grafy (nulové knihovny typu Recharts/Chart.js):
         - Sloupcový graf (Bar Chart): Porovnání příjmů vs. výdajů za aktuální měsíc.
         - Kategorie donut/koláčový graf (Donut Chart): Distribuce výdajů podle kategorií s barvami a legendou.
         - Všechny SVG grafy musí plně respektovat dark/light CSS variables a skleněné pozadí.
    2. Vytvořit vanilla CSS styly v `src/apps/Finance/Finance.css`:
       - Elegantní glassmorphic layout s jemnými stíny, barevnými akcenty a responzivním gridem.
    3. Zaregistrovat aplikaci `Finance` v `src/data/apps.ts` importem komponenty a jejím namontováním do pole `APPS` (id: 'finance').
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Aplikace Finance je plně funkční, vykresluje transakce, filtruje, kreslí SVG grafy a je úspěšně namontována v jádru OS.
  </done>
</task>

<task type="auto">
  <name>Oživení Bento Desktop Widgetů a refaktor FileManageru</name>
  <files>
    <file>src/apps/FileManager/FileManager.tsx</file>
    <file>src/shell/Desktop/Desktop.tsx</file>
    <file>src/shell/Desktop/Desktop.css</file>
  </files>
  <action>
    1. Refaktorovat `src/apps/FileManager/FileManager.tsx`:
       - Upravit komponentu tak, aby využívala globální `useFilesStore` místo lokálního `useState` pro seznam souborů a operace upload/delete.
    2. Oživit plochu v `src/shell/Desktop/Desktop.tsx`:
       - **Hodiny a datum widget**: Implementovat živý widget s vteřinovým intervalem (`setInterval`), který zobrazuje aktuální čas a datum v češtině.
       - **Finance Budget widget**: Načítat data z `useFinanceStore` a zobrazit barový indikátor celkového poměru příjmů a výdajů v aktuálním měsíci.
       - **Úkoly widget**: Propojit checklist s `useTasksStore` a umožnit rychlé odškrtávání úkolů přímo z desktopové dlaždice bez nutnosti otevírat aplikaci.
       - **Poslední soubory widget**: Zobrazit 3-4 nejnovější nahrané soubory z `useFilesStore` s ikonami a možností přímého otevření/preview po kliknutí.
       - Přidat pod widgety možnost rychlého prokliku, který přímo otevře příslušné okno aplikace přes `windowStore.openWindow`.
    3. Upravit a doladit CSS styly v `src/shell/Desktop/Desktop.css` pro dokonalé zarovnání a moderní vizuální dojem.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Bento plocha je plně dynamická, Hodiny běží v reálném čase, checklist úkolů, budget bar a soubory jsou synchronizovány s reálnými daty. FileManager funguje nad sdíleným storem.
  </done>
</task>

## Success Criteria
- [ ] Aplikace Finance umožňuje zadávat transakce a perzistentně je ukládá do Appwrite.
- [ ] SVG grafy jsou responsivní, plně glassmorphic a mění barvy podle aktivního dark/light tématu.
- [ ] Bento plocha zobrazuje live hodiny, dynamický checklist úkolů s možností toggle, transakční budget bar a seznam posledních nahraných souborů.
- [ ] Produkční sestavení (`npm run build`) proběhne úspěšně a bez chyb.
