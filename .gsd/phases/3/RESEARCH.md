# Výzkum a Technická Analýza — Fáze 3: Core Aplikace & Produktivita

Tento dokument detailně popisuje technický výzkum, API rozhraní, datové modely a návrh komponent pro pět core aplikací systému **Canvas OS** a jejich integraci s Appwrite backendem a globálními Zustand stores.

---

## 1. Rich-Text Editor v Poznámkách (Tiptap)

Pro aplikaci **Poznámky** byl vybrán **Tiptap** (`@tiptap/react` a `@tiptap/starter-kit`), což je headless rich-text editor postavený na ProseMirroru.

### Klíčové vlastnosti
- **Headless design**: Neobsahuje předem nadefinovaný vzhled, což nám umožňuje stoprocentní kontrolu nad glassmorphic designem a dark/light tématem pomocí Vanilla CSS.
- **JSON / HTML Formát**: Data poznámek jsou v Appwrite kolekci `notes` uložena jako HTML string (pro snadné vykreslení preview) a případně JSON string (pro plnou obnovu stavu editoru).
- **Auto-save mechanismus**: Ukládání změn probíhá s debouncem (např. 1000ms po dokončení psaní), aby se šetřilo API volání do Appwrite, přičemž Zustand store se aktualizuje okamžitě (optimistický update).

### Příklad integrace Tiptap editoru v Reactu
```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function NotesEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="tiptap-editor-wrapper">
      {/* Custom glassmorphic toolbar */}
      <div className="editor-toolbar">
        <button 
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'active' : ''}
        >
          B
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'active' : ''}
        >
          I
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}
        >
          H1
        </button>
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
```

---

## 2. Nativní React + CSS Grid Kalendář

Abychom se vyhnuli těžkým závislostem (jako FullCalendar), implementujeme vlastní lehký a plně responzivní měsíční grid.

### Výpočet měsíce a gridu
1. **Počet dní v měsíci**: `new Date(year, month + 1, 0).getDate()`
2. **První den v měsíci (index dne v týdnu)**: `(new Date(year, month, 1).getDay() + 6) % 7` (převod na pondělí = 0)
3. **Předchozí a následující měsíc**: dopočítání "padding" dní pro dokončení řádků gridu.

### CSS Grid struktura
```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
}
.calendar-day-cell {
  aspect-ratio: 1;
  background: var(--bg-card-glass);
  border-radius: 8px;
  padding: 6px;
  position: relative;
  transition: background 0.2s, transform 0.1s;
}
.calendar-day-cell:hover {
  background: var(--bg-hover-glass);
  transform: translateY(-2px);
}
```

---

## 3. Správce souborů (Appwrite Storage Integration)

Správce souborů se připojuje na Appwrite Storage Bucket `files` (ID: `files`).

### Virtuální složky a hierarchie
Vzhledem k tomu, že Appwrite Storage nepodporuje nativní složkovou strukturu (ukládá plochý seznam souborů), implementujeme hierarchii složek pomocí **předpon v názvu souboru** nebo **virtuální metadatové databáze**.
Rozhodli jsme se pro čisté a robustní řešení:
- Soubory jsou nahrávány s meta-informacemi.
- Pro zjednodušení a spolehlivost uložíme do atributů souboru (custom metadata) parametr `folderPath` (např. `/dokumenty/prace`).
- Uživatel v aplikaci prochází virtuální strom složek. Kliknutí na virtuální složku vyfiltruje soubory s odpovídajícím `folderPath`.

### Nahrávání s progress barem
Appwrite SDK poskytuje callback `onProgress` během nahrávání souboru:
```typescript
import { storage } from '@/lib/appwrite';
import { BUCKET_FILES } from '@/lib/dbSetup';

const uploadFile = async (file: File, folderPath: string, onProgress: (progress: number) => void) => {
  return await storage.createFile(
    BUCKET_FILES,
    'unique()',
    file,
    ['role:all'], // Oprávnění
    (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      onProgress(percentage);
    }
  );
};
```

---

## 4. PDF Viewer (Inline & Handlery)

PDF Prohlížeč bude v Canvas OS integrovanou systémovou aplikací.

### Integrace a spuštění
1. **Nativní embed**: Použijeme bezpečný element `<iframe src={fileUrl} width="100%" height="100%" />` nebo `<embed src={fileUrl} type="application/pdf" />`. Moderní prohlížeče mají vestavěný robustní PDF prohlížeč s podporou zoomu, tisku a stahování.
2. **Přístup z FileManageru**: Kliknutí na jakýkoliv soubor s koncovkou `.pdf` ve Správci souborů zavolá akci:
   ```typescript
   windowStore.openWindow(pdfViewerApp, { 
     fileUrl: storage.getFileView(BUCKET_FILES, fileId).href,
     fileName: file.name
   });
   ```
3. **Zástupce na ploše**: Samostatná ikona PDF Vieweru v launcheru umožní uživateli otevřít prázdnou instanci s tlačítkem „Vybrat soubor ze Správce souborů“.

---

## 5. Kanban & List hybridní Úkoly (HTML5 Drag & Drop)

Aplikace **Úkoly** obsahuje přepínač mezi sloupcovým Kanban Boardem a tabulkovým List View.

### Custom HTML5 Drag & Drop
Pro Kanban desku využijeme nativní HTML5 Drag and Drop API, které je extrémně rychlé, bez závislostí a plně pod kontrolou:
- **Draggable karty**: `<div draggable onDragStart={(e) => handleDragStart(e, task.$id)}>...</div>`
- **Drop sloupce**: `<div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'in_progress')}>...</div>`
- **Akce po dropu**: Změna stavu úkolu v Zustand store `updateTask(taskId, { status: newStatus })`, což okamžitě aktualizuje UI (Kanban sloupce) i desktopový widget a spustí synchronizaci do Appwrite na pozadí.

---

## 6. Barevná paleta a Visual Guidelines (Glassmorphism)

Všechny aplikace budou respektovat přísná pravidla moderního skleněného designu (glassmorphism):
- Pozadí oken: `background: rgba(13, 15, 26, 0.65)` (tmavý režim) a `background: rgba(255, 255, 255, 0.65)` (světlý režim) s filtrem `backdrop-filter: blur(16px)`.
- Okraje: tenké, polo-transparentní `border: 1px solid rgba(255, 255, 255, 0.08)`.
- Akcenty: Fialová violet `#6C47FF`, zelená `#22C55E` pro schválené/dokončené stavy, modrá `#3B82F6` pro úkoly a žlutá/oranžová `#F59E0B` pro složky.
- Interaktivita: Jemné hover zvětšení a záře `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)`.
