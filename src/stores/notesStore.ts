import { create } from 'zustand';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID, COLLECTION_NOTES } from '@/lib/dbSetup';

export interface NoteDocument {
  $id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  $createdAt: string;
  $updatedAt: string;
}

interface NotesState {
  notes: NoteDocument[];
  activeNoteId: string | null;
  isLoading: boolean;
  loadNotes: (userId: string) => Promise<void>;
  createNote: (userId: string, title: string, content?: string, tags?: string[]) => Promise<NoteDocument>;
  updateNote: (noteId: string, updates: { title?: string; content?: string; tags?: string[] }) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  isLoading: false,

  loadNotes: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_NOTES,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$updatedAt')
        ]
      );
      set({ notes: res.documents as any[], isLoading: false });
    } catch (err) {
      console.warn('[Notes Store] Nepodařilo se načíst poznámky, možná kolekce neexistuje. Používám prázdný seznam.', err);
      set({ notes: [], isLoading: false });
    }
  },

  createNote: async (userId, title, content = '', tags = []) => {
    const newDoc = {
      userId,
      title,
      content,
      tags
    };

    try {
      const note = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_NOTES,
        ID.unique(),
        newDoc
      ) as any as NoteDocument;

      set((state) => ({
        notes: [note, ...state.notes],
        activeNoteId: note.$id
      }));

      return note;
    } catch (err) {
      console.error('[Notes Store] Nepodařilo se vytvořit poznámku v databázi:', err);
      // Vytvoříme lokální fallback dokument, aby aplikace fungovala i bez spuštěné DB
      const mockNote: NoteDocument = {
        $id: `mock-${Date.now()}`,
        userId,
        title,
        content,
        tags,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };
      set((state) => ({
        notes: [mockNote, ...state.notes],
        activeNoteId: mockNote.$id
      }));
      return mockNote;
    }
  },

  updateNote: async (noteId, updates) => {
    // Okamžitá aktualizace v paměti pro bleskovou odezvu (optimistický update)
    const originalNotes = get().notes;
    set((state) => ({
      notes: state.notes.map((n) =>
        n.$id === noteId
          ? {
              ...n,
              ...updates,
              $updatedAt: new Date().toISOString()
            }
          : n
      )
    }));

    if (noteId.startsWith('mock-')) return; // Pouze offline mock data

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_NOTES,
        noteId,
        updates
      );
    } catch (err) {
      console.error('[Notes Store] Selhal zápis úpravy poznámky do databáze, vracím změny:', err);
      set({ notes: originalNotes });
    }
  },

  deleteNote: async (noteId) => {
    const originalNotes = get().notes;
    const { activeNoteId } = get();

    set((state) => {
      const nextNotes = state.notes.filter((n) => n.$id !== noteId);
      return {
        notes: nextNotes,
        activeNoteId: activeNoteId === noteId ? (nextNotes[0]?.$id || null) : activeNoteId
      };
    });

    if (noteId.startsWith('mock-')) return;

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_NOTES, noteId);
    } catch (err) {
      console.error('[Notes Store] Selhalo smazání poznámky z databáze, vracím změny:', err);
      set({ notes: originalNotes, activeNoteId });
    }
  },

  setActiveNoteId: (id) => set({ activeNoteId: id })
}));
