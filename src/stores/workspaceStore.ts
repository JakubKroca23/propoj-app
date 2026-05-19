import { create } from 'zustand';

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeId: string;
  setActive: (id: string) => void;
  addWorkspace: (name: string, icon: string, color: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [
    { id: 'personal', name: 'Osobní', icon: '🏠', color: '#6C47FF' },
    { id: 'work', name: 'Práce', icon: '💼', color: '#3B82F6' },
    { id: 'finance', name: 'Finance', icon: '💰', color: '#10B981' },
  ],
  activeId: 'personal',
  setActive: (id) => set({ activeId: id }),
  addWorkspace: (name, icon, color) => 
    set((state) => ({
      workspaces: [...state.workspaces, { id: crypto.randomUUID(), name, icon, color }],
    })),
}));
