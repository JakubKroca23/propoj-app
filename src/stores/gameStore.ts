import { create } from 'zustand';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID, COLLECTION_GAME } from '@/lib/dbSetup';

export interface HighScore {
  $id?: string;
  userId: string;
  userName: string;
  score: number;
  durationSeconds: number;
  wavesSurvived: number;
  date: string;
}

interface GameState {
  highScores: HighScore[];
  isLoading: boolean;
  error: string | null;
  loadHighScores: () => Promise<void>;
  saveHighScore: (
    score: number,
    durationSeconds: number,
    wavesSurvived: number,
    userId: string,
    userName: string
  ) => Promise<void>;
}

// Výchozí mock výsledky pro offline provoz a ty, co nemají vytvořenou tabulku v Appwrite
const DEFAULT_MOCK_SCORES: HighScore[] = [
  {
    $id: 'mock-1',
    userId: 'mock-user-1',
    userName: 'Karel Jeřábník',
    score: 12500,
    durationSeconds: 380,
    wavesSurvived: 12,
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    $id: 'mock-2',
    userId: 'mock-user-2',
    userName: 'Pepa Tatrovák',
    score: 8400,
    durationSeconds: 290,
    wavesSurvived: 8,
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    $id: 'mock-3',
    userId: 'mock-user-3',
    userName: 'Láďa Domíchávač',
    score: 5200,
    durationSeconds: 180,
    wavesSurvived: 5,
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'canvas_os_high_scores';

export const useGameStore = create<GameState>((set, get) => ({
  highScores: [],
  isLoading: false,
  error: null,

  loadHighScores: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1. Zkusit stáhnout z Appwrite
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_GAME,
        [Query.orderDesc('score'), Query.limit(10)]
      );

      const scores = response.documents.map((doc: any) => ({
        $id: doc.$id,
        userId: doc.userId,
        userName: doc.userName,
        score: doc.score,
        durationSeconds: doc.durationSeconds,
        wavesSurvived: doc.wavesSurvived,
        date: doc.date,
      }));

      // Uložíme do local storage pro případný příští offline stav
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
      set({ highScores: scores, isLoading: false });
    } catch (err: any) {
      console.warn('[Game Store] Selhalo stažení high scores z Appwrite, používám fallback:', err);
      
      // 2. Fallback na localStorage
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          set({ highScores: JSON.parse(cached), isLoading: false });
          return;
        } catch (_) {}
      }

      // 3. Fallback na výchozí data
      set({ highScores: DEFAULT_MOCK_SCORES, isLoading: false });
    }
  },

  saveHighScore: async (score, durationSeconds, wavesSurvived, userId, userName) => {
    set({ isLoading: true, error: null });
    const newRecord: Omit<HighScore, '$id'> = {
      userId,
      userName: userName || 'Neznámý strojař',
      score,
      durationSeconds,
      wavesSurvived,
      date: new Date().toISOString(),
    };

    try {
      // Zkusit uložit do Appwrite
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_GAME,
        ID.unique(),
        newRecord
      );
      
      // Znovu načteme skóre
      await get().loadHighScores();
    } catch (err: any) {
      console.error('[Game Store] Selhalo uložení skóre do Appwrite, ukládám lokálně:', err);
      
      // Fallback: uložíme do lokálního stavu a localStorage
      const currentScores = [...get().highScores];
      const localRecord: HighScore = {
        ...newRecord,
        $id: `local-${Date.now()}`,
      };
      
      currentScores.push(localRecord);
      // Seřadíme sestupně podle skóre a ořízneme na top 10
      currentScores.sort((a, b) => b.score - a.score);
      const topScores = currentScores.slice(0, 10);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(topScores));
      set({ highScores: topScores, isLoading: false });
    }
  },
}));
