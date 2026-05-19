import { create } from 'zustand';
import { account } from '@/lib/appwrite';
import { AppwriteUser } from '@/types';
import { initializeDatabase } from '@/lib/dbSetup';

interface AuthState {
  user: AppwriteUser | null;
  isLoading: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  
  init: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await account.get();
      set({ user, isLoading: false });
      // Inicializace databáze po načtení přihlášeného uživatele
      await initializeDatabase();
    } catch (err: any) {
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      set({ user, isLoading: false });
      // Inicializace databáze po přihlášení
      await initializeDatabase();
    } catch (err: any) {
      set({ error: err.message || 'Chyba při přihlášení', isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await account.deleteSession('current');
      set({ user: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Chyba při odhlášení', isLoading: false });
    }
  },
}));
