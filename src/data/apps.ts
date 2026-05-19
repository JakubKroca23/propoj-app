import React from 'react';

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
  component?: React.ComponentType<any> | null;
}

const Settings = React.lazy(() => import('@/apps/Settings/Settings'));
const FileManager = React.lazy(() => import('@/apps/FileManager/FileManager'));
const Notes = React.lazy(() => import('@/apps/Notes/Notes'));
const Calendar = React.lazy(() => import('@/apps/Calendar/Calendar'));
const Tasks = React.lazy(() => import('@/apps/Tasks/Tasks'));
const PdfViewer = React.lazy(() => import('@/apps/PdfViewer/PdfViewer'));
const Finance = React.lazy(() => import('@/apps/Finance/Finance'));
const Weather = React.lazy(() => import('@/apps/Weather/Weather'));
const Email = React.lazy(() => import('@/apps/Email/Email'));
const Game = React.lazy(() => import('@/apps/Game/Game'));

export const APPS: AppDefinition[] = [
  { id: 'files', name: 'Soubory', icon: '📁', description: 'Správce souborů', color: '#F59E0B', size: 'md', component: FileManager },
  { id: 'notes', name: 'Poznámky', icon: '📝', description: 'Rich-text poznámky', color: '#6C47FF', size: 'md', component: Notes },
  { id: 'calendar', name: 'Kalendář', icon: '📅', description: 'Události a připomínky', color: '#22C55E', size: 'md', component: Calendar },
  { id: 'tasks', name: 'Úkoly', icon: '✅', description: 'Kanban a seznam', color: '#3B82F6', size: 'md', component: Tasks },
  { id: 'finance', name: 'Finance', icon: '💰', description: 'Příjmy a výdaje', color: '#10B981', size: 'md', component: Finance },
  { id: 'email', name: 'Email', icon: '📧', description: 'IMAP inbox', color: '#EF4444', size: 'md', component: Email },
  { id: 'weather', name: 'Počasí', icon: '🌤', description: 'Předpověď počasí', color: '#0EA5E9', size: 'sm', component: Weather },
  { id: 'pdf-viewer', name: 'PDF Prohlížeč', icon: '📕', description: 'Prohlížení PDF dokumentů', color: '#EF4444', size: 'md', component: PdfViewer },
  { id: 'settings', name: 'Nastavení', icon: '⚙️', description: 'Systémová nastavení', color: '#8B91B0', size: 'sm', component: Settings },
  { id: 'game', name: 'Strategie', icon: '⚔️', description: 'RTS hra', color: '#DC2626', size: 'lg', component: Game },
];



