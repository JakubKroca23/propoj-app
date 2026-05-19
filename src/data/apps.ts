import React from 'react';
import Settings from '@/apps/Settings/Settings';

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
  component?: React.ComponentType<any> | null;
}

export const APPS: AppDefinition[] = [
  { id: 'files', name: 'Soubory', icon: '📁', description: 'Správce souborů', color: '#F59E0B', size: 'md' },
  { id: 'notes', name: 'Poznámky', icon: '📝', description: 'Rich-text poznámky', color: '#6C47FF', size: 'md' },
  { id: 'calendar', name: 'Kalendář', icon: '📅', description: 'Události a připomínky', color: '#22C55E', size: 'md' },
  { id: 'tasks', name: 'Úkoly', icon: '✅', description: 'Kanban a seznam', color: '#3B82F6', size: 'md' },
  { id: 'finance', name: 'Finance', icon: '💰', description: 'Příjmy a výdaje', color: '#10B981', size: 'md' },
  { id: 'email', name: 'Email', icon: '📧', description: 'IMAP inbox', color: '#EF4444', size: 'md' },
  { id: 'weather', name: 'Počasí', icon: '🌤', description: 'Předpověď počasí', color: '#0EA5E9', size: 'sm' },
  { id: 'settings', name: 'Nastavení', icon: '⚙️', description: 'Systémová nastavení', color: '#8B91B0', size: 'sm', component: Settings },
  { id: 'game', name: 'Strategie', icon: '⚔️', description: 'RTS hra', color: '#DC2626', size: 'lg' },
];
