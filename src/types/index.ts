import { Models } from 'appwrite';

export type AppwriteUser = Models.User<Models.Preferences>;

export interface AppWindow {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  url?: string;
  token?: string;
  params?: any;
}
