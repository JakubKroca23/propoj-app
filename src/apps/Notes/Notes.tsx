import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useNotesStore } from '@/stores/notesStore';
import { useAuthStore } from '@/stores/authStore';
import './Notes.css';

interface NotesProps {
  params?: {
    noteId?: string;
  };
}

export default function Notes({ params }: NotesProps) {
  const { user } = useAuthStore();
  const {
    notes,
    activeNoteId,
    isLoading,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    setActiveNoteId,
  } = useNotesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  const activeNoteIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronizace aktivní poznámky do ref pro debounced ukládání
  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  // Načtení poznámek při připojení
  useEffect(() => {
    if (user?.$id && notes.length === 0) {
      loadNotes(user.$id);
    }
  }, [user?.$id, loadNotes, notes.length]);

  // Reakce na parametry okna (např. z Command Baru)
  useEffect(() => {
    if (params?.noteId) {
      setActiveNoteId(params.noteId);
    }
  }, [params?.noteId, setActiveNoteId]);

  const activeNote = notes.find((n) => n.$id === activeNoteId);

  // Inicializace Tiptap Editoru
  const editor = useEditor({
    extensions: [StarterKit],
    content: activeNote?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (activeNoteIdRef.current) {
        // Vyčištění předchozího timeru
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        
        // Nastavení nového timeru pro auto-save po 800ms
        const currentId = activeNoteIdRef.current;
        debounceTimerRef.current = setTimeout(() => {
          updateNote(currentId, { content: html });
        }, 800);
      }
    },
  });

  // Aktualizace obsahu editoru při změně vybrané poznámky
  useEffect(() => {
    if (editor && activeNote) {
      const currentContent = editor.getHTML();
      if (currentContent !== activeNote.content) {
        editor.commands.setContent(activeNote.content);
      }
    }
  }, [activeNoteId, editor]);

  // Uklizení timeru při odpojení
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleCreateNote = async () => {
    if (!user?.$id) return;
    const title = 'Bez názvu';
    const note = await createNote(user.$id, title, '<p>Začněte psát...</p>', []);
    setActiveNoteId(note.$id);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeNoteId) return;
    const title = e.target.value;
    updateNote(activeNoteId, { title });
  };

  const handleDeleteNote = async () => {
    if (!activeNoteId) return;
    if (confirm('Opravdu chcete tuto poznámku smazat?')) {
      await deleteNote(activeNoteId);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toLowerCase();
    if (!activeNote.tags.includes(cleanTag)) {
      const tags = [...activeNote.tags, cleanTag];
      updateNote(activeNote.$id, { tags });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    const tags = activeNote.tags.filter((t) => t !== tagToRemove);
    updateNote(activeNote.$id, { tags });
  };

  // Získání unikátních tagů pro boční filtr
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  );

  // Filtrování poznámek
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.replace(/<[^>]*>/g, '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? n.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  // Pomocná funkce pro vyčištění HTML pro preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Formátování data
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="notes-app">
      {/* Levý panel - seznam poznámek */}
      <aside className="notes-sidebar">
        <div className="sidebar-header">
          <button onClick={handleCreateNote} className="btn-new-note">
            <span className="plus-icon">+</span> Nová poznámka
          </button>
          <input
            type="text"
            placeholder="Vyhledat poznámky..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="notes-search-input"
          />
        </div>

        {/* Filtr štítků */}
        {allTags.length > 0 && (
          <div className="tags-filter-bar">
            <button
              onClick={() => setSelectedTag(null)}
              className={`tag-pill ${selectedTag === null ? 'active' : ''}`}
            >
              Vše
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`tag-pill ${selectedTag === t ? 'active' : ''}`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {/* Seznam poznámek */}
        <div className="notes-list">
          {isLoading ? (
            <div className="notes-list-loading">Načítání poznámek...</div>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((n) => (
              <div
                key={n.$id}
                onClick={() => setActiveNoteId(n.$id)}
                className={`note-item ${n.$id === activeNoteId ? 'active' : ''}`}
              >
                <div className="note-item-title">{n.title || 'Bez názvu'}</div>
                <div className="note-item-snippet">
                  {stripHtml(n.content).substring(0, 50) || 'Žádný text...'}
                </div>
                <div className="note-item-meta">
                  <span className="note-item-date">{formatDate(n.$updatedAt)}</span>
                  {n.tags && n.tags.length > 0 && (
                    <span className="note-item-tags-badge">
                      #{n.tags[0]} {n.tags.length > 1 ? `+${n.tags.length - 1}` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="notes-list-empty">Žádné poznámky nebyly nalezeny.</div>
          )}
        </div>
      </aside>

      {/* Pravý panel - editor */}
      <main className="notes-main">
        {activeNote ? (
          <div className="note-editor">
            {/* Hlavička editoru s titulkem a štítky */}
            <div className="editor-header">
              <input
                type="text"
                value={activeNote.title}
                onChange={handleTitleChange}
                placeholder="Název poznámky"
                className="note-title-input"
              />
              <button
                onClick={handleDeleteNote}
                className="btn-delete-note"
                title="Smazat poznámku"
              >
                🗑
              </button>
            </div>

            {/* Štítky poznámky */}
            <div className="editor-tags-row">
              <div className="current-tags">
                {activeNote.tags?.map((t) => (
                  <span key={t} className="note-tag">
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="btn-remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="add-tag-form">
                <input
                  type="text"
                  placeholder="+ nový štítek"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="add-tag-input"
                />
              </form>
            </div>

            {/* Tiptap Toolbar */}
            {editor && (
              <div className="editor-toolbar">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
                  title="Tučné"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
                  title="Kurzíva"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
                  title="Přeškrtnuté"
                >
                  S
                </button>
                <div className="toolbar-divider" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
                  title="Nadpis 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                  title="Nadpis 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                  title="Odrážkový seznam"
                >
                  • Seznam
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                  title="Číselný seznam"
                >
                  1. Seznam
                </button>
                <div className="toolbar-divider" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
                  title="Blok kódu"
                >
                  &lt;/&gt;
                </button>
              </div>
            )}

            {/* Vlastní plocha editoru */}
            <div className="editor-scroll-area">
              <EditorContent editor={editor} />
            </div>
            
            <div className="note-status-bar">
              <span>Poslední uložení: {formatDate(activeNote.$updatedAt)}</span>
              <span>
                Slov: {stripHtml(activeNote.content).trim() === '' ? 0 : stripHtml(activeNote.content).trim().split(/\s+/).length}
              </span>
            </div>
          </div>
        ) : (
          <div className="note-placeholder">
            <div className="placeholder-icon">📝</div>
            <h3>Moje Poznámky</h3>
            <p>Vyberte poznámku z levého panelu nebo vytvořte novou.</p>
            <button onClick={handleCreateNote} className="btn-new-note-primary">
              Vytvořit první poznámku
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
