import { create } from 'zustand';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID, COLLECTION_FINANCE } from '@/lib/dbSetup';

export interface FinanceTransaction {
  $id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  $createdAt: string;
  $updatedAt: string;
}

interface FinanceState {
  transactions: FinanceTransaction[];
  isLoading: boolean;
  loadTransactions: (userId: string) => Promise<void>;
  addTransaction: (
    userId: string,
    type: 'income' | 'expense',
    amount: number,
    category: string,
    date: string,
    description: string
  ) => Promise<FinanceTransaction>;
  deleteTransaction: (transactionId: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadTransactions: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_FINANCE,
        [
          Query.equal('userId', userId),
          Query.orderDesc('date'),
          Query.orderDesc('$createdAt')
        ]
      );
      set({ transactions: res.documents as any[], isLoading: false });
    } catch (err) {
      console.warn('[Finance Store] Nepodařilo se načíst transakce z Appwrite, používám lokální mock data.', err);
      // Seřadíme výchozí mock data
      const mockTransactions: FinanceTransaction[] = [
        {
          $id: 'mock-fin-1',
          userId,
          type: 'income',
          amount: 45000,
          category: 'Plat',
          date: new Date().toISOString().split('T')[0],
          description: 'Měsíční výplata z hlavního projektu',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        {
          $id: 'mock-fin-2',
          userId,
          type: 'expense',
          amount: 15000,
          category: 'Bydlení',
          date: new Date().toISOString().split('T')[0],
          description: 'Nájemné a poplatky za byt',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        {
          $id: 'mock-fin-3',
          userId,
          type: 'expense',
          amount: 2400,
          category: 'Jídlo',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          description: 'Týdenní nákup v Lidlu',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        {
          $id: 'mock-fin-4',
          userId,
          type: 'expense',
          amount: 1200,
          category: 'Zábava',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          description: 'Lístky do kina a večeře',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        {
          $id: 'mock-fin-5',
          userId,
          type: 'income',
          amount: 5000,
          category: 'Ostatní',
          date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
          description: 'Prodej starého monitoru na bazoši',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        {
          $id: 'mock-fin-6',
          userId,
          type: 'expense',
          amount: 850,
          category: 'Služby',
          date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
          description: 'Předplatné Spotify a Netflix',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        }
      ];
      // Sort by date desc
      mockTransactions.sort((a, b) => b.date.localeCompare(a.date));
      set({ transactions: mockTransactions, isLoading: false });
    }
  },

  addTransaction: async (userId, type, amount, category, date, description) => {
    const newDoc = {
      userId,
      type,
      amount,
      category,
      date,
      description
    };

    try {
      const transaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_FINANCE,
        ID.unique(),
        newDoc
      ) as any as FinanceTransaction;

      set((state) => ({
        transactions: [transaction, ...state.transactions].sort((a, b) => b.date.localeCompare(a.date))
      }));

      return transaction;
    } catch (err) {
      console.error('[Finance Store] Nepodařilo se vytvořit transakci v databázi:', err);
      const mockTransaction: FinanceTransaction = {
        $id: `mock-${Date.now()}`,
        userId,
        type,
        amount,
        category,
        date,
        description,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };
      set((state) => ({
        transactions: [mockTransaction, ...state.transactions].sort((a, b) => b.date.localeCompare(a.date))
      }));
      return mockTransaction;
    }
  },

  deleteTransaction: async (transactionId) => {
    const originalTransactions = get().transactions;

    set((state) => ({
      transactions: state.transactions.filter((t) => t.$id !== transactionId)
    }));

    if (transactionId.startsWith('mock-')) return;

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_FINANCE, transactionId);
    } catch (err) {
      console.error('[Finance Store] Selhalo smazání transakce z DB:', err);
      set({ transactions: originalTransactions });
    }
  }
}));
