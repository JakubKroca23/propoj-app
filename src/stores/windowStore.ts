import { create } from 'zustand';
import { AppWindow } from '@/types';
import { AppDefinition } from '@/data/apps';
import { getNextZIndex } from '@/utils/zIndexManager';
import { generateWindowId } from '@/utils/windowUtils';

interface WindowStore {
  windows: AppWindow[];
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  openWindow: (app: AppDefinition) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],
  isDragging: false,
  setIsDragging: (v) => set({ isDragging: v }),

  openWindow: (app) =>
    set((state) => {
      const existing = state.windows.find((w) => w.appId === app.id);
      if (existing) {
        return {
          windows: state.windows.map((w) =>
            w.appId === app.id
              ? { ...w, isMinimized: false, zIndex: getNextZIndex() }
              : w
          ),
        };
      }

      const offset = (state.windows.length % 6) * 30;
      const width = 800;
      const height = 560;
      const x = Math.max(20, (window.innerWidth - width) / 2 + offset);
      const y = Math.max(20, (window.innerHeight - height - 56) / 2 + offset);

      const newWindow: AppWindow = {
        id: generateWindowId(),
        appId: app.id,
        title: app.name,
        icon: app.icon,
        x,
        y,
        width,
        height,
        zIndex: getNextZIndex(),
        isMinimized: false,
        isMaximized: false,
      };

      return {
        windows: [...state.windows, newWindow],
      };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    })),

  focusWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: getNextZIndex() } : w
      ),
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
    })),

  restoreWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: getNextZIndex() } : w
      ),
    })),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    })),

  updatePosition: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })),

  updateSize: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),
}));
