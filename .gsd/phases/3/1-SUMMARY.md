# Summary — Plan 3.1: Dokumenty a Časový plán (Poznámky & Kalendář)

## Objective
Implementovat aplikace **Poznámky** (Tiptap rich-text editor, štítky, full-text vyhledávání) a **Kalendář** (custom CSS Grid měsíční kalendář se správou událostí) s perzistencí dat a synchronizací s widgety.

## Co bylo implementováno

### 1. Aplikace Poznámky (`src/apps/Notes/`)
- **Notes.tsx**:
  - Levý boční panel s vyhledáváním poznámek, tlačítkem "Nová poznámka" a filtrem štítků (tags).
  - Integrace WYSIWYG editoru **Tiptap** s minimalistickým glassmorphic toolbar panelem (B, I, S, H1, H2, odrážkový a číselný seznam, blok kódu).
  - Reakce na parametry okna (`win.params?.noteId`) pro přímé otevření z vyhledávání / widgetů.
  - Auto-save mechanismus ukládání obsahu, názvu a štítků s debouncem 800ms pro optimální počet API requestů do Appwrite.
- **Notes.css**:
  - Plnohodnotný dark/light glassmorphic vzhled.
  - Stylování editoru ProseMirror a responzivní zobrazení.

### 2. Aplikace Kalendář (`src/apps/Calendar/`)
- **Calendar.tsx**:
  - Elegantní mesíční zobrazení (Po-Ne) vygenerované pomocí lehkých datumových algoritmů.
  - Tlačítka pro rychlý přechod na předchozí/následující měsíc a návrat na dnešní den.
  - Podpora prokliků na buňky pro vytvoření nové události s automatickým předvyplněním vybraného data.
  - Podpora prokliků na barevné badges událostí pro zobrazení detailu, úpravy či smazání.
  - Hluboké prolinkování z parametrů okna (`win.params?.eventId`) pro okamžité zobrazení a otevření detailu události.
- **Calendar.css**:
  - CSS Grid rozložení, styly pro dnešní den (highlighted pill).
  - Detaily a formuláře v plně glassmorphic modálním okně s rozostřeným pozadím (`backdrop-filter`).

## Ověření a Verifikace
Spuštění lokální typové kontroly:
```bash
npx tsc --noEmit
```
Kompilace i typy proběhly bez jediné chyby.
