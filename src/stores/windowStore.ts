import { create } from 'zustand';
import { AppWindow } from '@/types';

interface WindowState {
  windows: AppWindow[];
}

export const useWindowStore = create<WindowState>(() => ({
  windows: [],
}));
