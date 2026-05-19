import { create } from 'zustand';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID, COLLECTION_EVENTS } from '@/lib/dbSetup';

export interface CalendarEventDocument {
  $id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  allDay: boolean;
  color: string; // hex nebo CSS variable třída
  $createdAt: string;
  $updatedAt: string;
}

interface CalendarState {
  events: CalendarEventDocument[];
  isLoading: boolean;
  loadEvents: (userId: string) => Promise<void>;
  createEvent: (
    userId: string,
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    allDay?: boolean,
    color?: string
  ) => Promise<CalendarEventDocument>;
  updateEvent: (eventId: string, updates: Partial<Omit<CalendarEventDocument, '$id' | '$createdAt' | '$updatedAt'>>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  isLoading: false,

  loadEvents: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_EVENTS,
        [
          Query.equal('userId', userId)
        ]
      );
      set({ events: res.documents as any[], isLoading: false });
    } catch (err) {
      console.warn('[Calendar Store] Nepodařilo se načíst události, možná kolekce neexistuje. Používám prázdný seznam.', err);
      // Výchozí demonstrativní mock schůzky
      const today = new Date();
      
      const createDateISO = (hour: number, minute: number) => {
        const d = new Date(today);
        d.setHours(hour, minute, 0, 0);
        return d.toISOString();
      };

      const mockEvents: CalendarEventDocument[] = [
        {
          $id: 'mock-event-1',
          userId,
          title: 'Týmový Sync — propoj.app',
          description: 'Pravidelný status projektu, kontrola postupu shellu a sandboxů',
          startDate: createDateISO(14, 0),
          endDate: createDateISO(15, 0),
          allDay: false,
          color: '#6C47FF',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        {
          $id: 'mock-event-2',
          userId,
          title: 'Večeře s investory',
          description: 'Prezentace dema Canvas OS v restauraci Kampa Park',
          startDate: createDateISO(19, 30),
          endDate: createDateISO(21, 0),
          allDay: false,
          color: '#22C55E',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        }
      ];
      set({ events: mockEvents, isLoading: false });
    }
  },

  createEvent: async (userId, title, description, startDate, endDate, allDay = false, color = '#6C47FF') => {
    const newDoc = {
      userId,
      title,
      description,
      startDate,
      endDate,
      allDay,
      color
    };

    try {
      const event = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_EVENTS,
        ID.unique(),
        newDoc
      ) as any as CalendarEventDocument;

      set((state) => ({
        events: [...state.events, event]
      }));

      return event;
    } catch (err) {
      console.error('[Calendar Store] Nepodařilo se vytvořit událost v DB:', err);
      const mockEvent: CalendarEventDocument = {
        $id: `mock-${Date.now()}`,
        userId,
        title,
        description,
        startDate,
        endDate,
        allDay,
        color,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };
      set((state) => ({
        events: [...state.events, mockEvent]
      }));
      return mockEvent;
    }
  },

  updateEvent: async (eventId, updates) => {
    const originalEvents = get().events;
    
    set((state) => ({
      events: state.events.map((e) =>
        e.$id === eventId
          ? {
              ...e,
              ...updates,
              $updatedAt: new Date().toISOString()
            }
          : e
      )
    }));

    if (eventId.startsWith('mock-')) return;

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_EVENTS,
        eventId,
        updates
      );
    } catch (err) {
      console.error('[Calendar Store] Selhal zápis úpravy události do DB:', err);
      set({ events: originalEvents });
    }
  },

  deleteEvent: async (eventId) => {
    const originalEvents = get().events;

    set((state) => ({
      events: state.events.filter((e) => e.$id !== eventId)
    }));

    if (eventId.startsWith('mock-')) return;

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_EVENTS, eventId);
    } catch (err) {
      console.error('[Calendar Store] Selhalo smazání události z DB:', err);
      set({ events: originalEvents });
    }
  }
}));
