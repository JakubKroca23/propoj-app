import { create } from 'zustand';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID, COLLECTION_TASKS } from '@/lib/dbSetup';

export interface TaskDocument {
  $id: string;
  userId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  $createdAt: string;
  $updatedAt: string;
}

interface TasksState {
  tasks: TaskDocument[];
  isLoading: boolean;
  loadTasks: (userId: string) => Promise<void>;
  createTask: (
    userId: string,
    title: string,
    description?: string,
    priority?: 'low' | 'medium' | 'high',
    dueDate?: string,
    tags?: string[]
  ) => Promise<TaskDocument>;
  updateTask: (taskId: string, updates: Partial<Omit<TaskDocument, '$id' | '$createdAt' | '$updatedAt'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,

  loadTasks: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_TASKS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt')
        ]
      );
      set({ tasks: res.documents as any[], isLoading: false });
    } catch (err) {
      console.warn('[Tasks Store] Nepodařilo se načíst úkoly, možná kolekce neexistuje. Používám prázdný seznam.', err);
      // Seřadíme výchozí mock data
      const mockTasks: TaskDocument[] = [
        {
          $id: 'mock-task-1',
          userId,
          title: 'Vytvořit postMessage sandbox bridge',
          description: 'Zabezpečit pluginy a nastavit zprávy',
          status: 'done',
          priority: 'high',
          tags: ['systém'],
          $createdAt: new Date(Date.now() - 3600000).toISOString(),
          $updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          $id: 'mock-task-2',
          userId,
          title: 'Implementovat Tiptap editor do Poznámek',
          description: 'Rich text editor s tagy a synchronizací',
          status: 'todo',
          priority: 'high',
          tags: ['vývoj', 'core'],
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        {
          $id: 'mock-task-3',
          userId,
          title: 'Vyladit Bento widgety na ploše',
          description: 'CSS Grid, responsive layout',
          status: 'todo',
          priority: 'medium',
          tags: ['design'],
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        }
      ];
      set({ tasks: mockTasks, isLoading: false });
    }
  },

  createTask: async (userId, title, description = '', priority = 'medium', dueDate = '', tags = []) => {
    const newDoc = {
      userId,
      title,
      description,
      status: 'todo' as const,
      priority,
      dueDate: dueDate || undefined,
      tags
    };

    try {
      const task = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_TASKS,
        ID.unique(),
        newDoc
      ) as any as TaskDocument;

      set((state) => ({
        tasks: [task, ...state.tasks]
      }));

      return task;
    } catch (err) {
      console.error('[Tasks Store] Nepodařilo se vytvořit úkol v databázi:', err);
      const mockTask: TaskDocument = {
        $id: `mock-${Date.now()}`,
        userId,
        title,
        description,
        status: 'todo',
        priority,
        dueDate: dueDate || undefined,
        tags,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };
      set((state) => ({
        tasks: [mockTask, ...state.tasks]
      }));
      return mockTask;
    }
  },

  updateTask: async (taskId, updates) => {
    const originalTasks = get().tasks;
    
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.$id === taskId
          ? {
              ...t,
              ...updates,
              $updatedAt: new Date().toISOString()
            }
          : t
      )
    }));

    if (taskId.startsWith('mock-')) return;

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_TASKS,
        taskId,
        updates
      );
    } catch (err) {
      console.error('[Tasks Store] Selhal zápis úpravy úkolu do DB:', err);
      set({ tasks: originalTasks });
    }
  },

  deleteTask: async (taskId) => {
    const originalTasks = get().tasks;

    set((state) => ({
      tasks: state.tasks.filter((t) => t.$id !== taskId)
    }));

    if (taskId.startsWith('mock-')) return;

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_TASKS, taskId);
    } catch (err) {
      console.error('[Tasks Store] Selhalo smazání úkolu z DB:', err);
      set({ tasks: originalTasks });
    }
  },

  toggleTaskStatus: async (taskId) => {
    const task = get().tasks.find((t) => t.$id === taskId);
    if (!task) return;

    const nextStatus: TaskDocument['status'] = task.status === 'done' ? 'todo' : 'done';
    await get().updateTask(taskId, { status: nextStatus });
  }
}));
