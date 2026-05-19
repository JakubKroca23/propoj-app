import { create } from 'zustand';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID, COLLECTION_PLUGINS, COLLECTION_PREFERENCES } from '@/lib/dbSetup';
import { APPS } from '@/data/apps';

export interface BentoTile {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
  url?: string; // Pouze pro pluginy běžící v iframe
  enabled: boolean;
  isPlugin: boolean;
  component?: React.ComponentType<any> | null;
}

export interface PluginDocument {
  $id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  permissions: string; // JSON string
  enabled: boolean;
}

interface BentoState {
  tiles: BentoTile[];
  plugins: PluginDocument[];
  isLoading: boolean;
  prefDocId: string | null;
  loadBentoData: (userId: string) => Promise<void>;
  updateTileOrder: (fromIndex: number, toIndex: number, userId: string) => Promise<void>;
  installPlugin: (manifestUrl: string, userId: string) => Promise<void>;
  togglePlugin: (pluginId: string, enabled: boolean, userId: string) => Promise<void>;
  uninstallPlugin: (pluginId: string, userId: string) => Promise<void>;
}

export const useBentoStore = create<BentoState>((set, get) => ({
  tiles: [],
  plugins: [],
  isLoading: false,
  prefDocId: null,

  loadBentoData: async (userId) => {
    set({ isLoading: true });
    try {
      // 1. Načíst všechny pluginy z Appwrite
      const pluginResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_PLUGINS
      );
      
      let allPlugins = (pluginResult.documents as any[]) as PluginDocument[];

      // Automatická instalace Kalkulačky, pokud je registr pluginů prázdný
      if (allPlugins.length === 0) {
        try {
          const calcUrl = `${window.location.origin}/plugins/calculator/index.html`;
          const newDoc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_PLUGINS,
            ID.unique(),
            {
              name: 'Kalkulačka',
              description: 'Jednoduchá kalkulačka běžící v bezpečném sandboxu pluginu',
              url: calcUrl,
              icon: '🧮',
              permissions: JSON.stringify(['notification']),
              enabled: true,
            }
          );
          allPlugins = [newDoc as any];
        } catch (seedErr) {
          console.error('[Bento Store] Nepodařilo se automaticky nainstalovat ukázkovou Kalkulačku:', seedErr);
        }
      }

      const activePlugins = allPlugins.filter((p) => p.enabled);

      // 2. Převést standardní aplikace do jednotného formátu BentoTile
      const standardTiles: BentoTile[] = APPS.map((app) => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
        description: app.description,
        color: app.color,
        size: app.size,
        enabled: true,
        isPlugin: false,
        component: app.component,
      }));

      // 3. Převést aktivní pluginy do jednotného formátu BentoTile
      const pluginTiles: BentoTile[] = activePlugins.map((p) => ({
        id: p.$id,
        name: p.name,
        icon: p.icon || '🧩',
        description: p.description || '',
        color: '#8B5CF6', // Fialový gradient pro pluginy
        size: 'md',
        url: p.url,
        enabled: true,
        isPlugin: true,
      }));

      // Spojíme standardní aplikace a pluginy
      let mergedTiles = [...standardTiles, ...pluginTiles];

      // 4. Načíst uživatelské preference z databáze
      const prefResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_PREFERENCES,
        [Query.equal('userId', userId)]
      );

      let docId = null;
      if (prefResult.documents.length > 0) {
        const prefDoc = prefResult.documents[0];
        docId = prefDoc.$id;
        
        try {
          const savedIds = JSON.parse(prefDoc.gridLayout) as string[];
          
          // Seřadíme kachličky podle uloženého pořadí
          const sortedTiles: BentoTile[] = [];
          
          // Nejprve projdeme uložené ID a vložíme je v tomto pořadí
          savedIds.forEach((id) => {
            const tile = mergedTiles.find((t) => t.id === id);
            if (tile) {
              sortedTiles.push(tile);
            }
          });
          
          // Případné nové aplikace nebo pluginy, které v uloženém layoutu nejsou,
          // přidáme nakonec
          mergedTiles.forEach((tile) => {
            if (!sortedTiles.some((t) => t.id === tile.id)) {
              sortedTiles.push(tile);
            }
          });
          
          mergedTiles = sortedTiles;
        } catch (e) {
          console.error('[Bento Store] Chyba při parsování gridLayout:', e);
        }
      } else {
        // Preference neexistují -> vytvoříme je s výchozím pořadím
        const defaultIds = mergedTiles.map((t) => t.id);
        const newDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_PREFERENCES,
          ID.unique(),
          {
            userId,
            gridLayout: JSON.stringify(defaultIds),
          }
        );
        docId = newDoc.$id;
      }

      set({
        tiles: mergedTiles,
        plugins: allPlugins,
        prefDocId: docId,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Bento Store] Nepodařilo se načíst Bento data:', error);
      // Fallback na standardní aplikace
      const standardTiles: BentoTile[] = APPS.map((app) => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
        description: app.description,
        color: app.color,
        size: app.size,
        enabled: true,
        isPlugin: false,
        component: app.component,
      }));
      set({ tiles: standardTiles, plugins: [], prefDocId: null, isLoading: false });
    }
  },

  updateTileOrder: async (fromIndex, toIndex, userId) => {
    const { tiles, prefDocId } = get();
    if (fromIndex < 0 || fromIndex >= tiles.length || toIndex < 0 || toIndex >= tiles.length) {
      return;
    }

    const updatedTiles = [...tiles];
    const [draggedItem] = updatedTiles.splice(fromIndex, 1);
    updatedTiles.splice(toIndex, 0, draggedItem);

    // Okamžitě aktualizujeme UI stav pro plynulost
    set({ tiles: updatedTiles });

    // Uložíme nové rozložení do Appwrite
    if (prefDocId) {
      try {
        const gridLayout = JSON.stringify(updatedTiles.map((t) => t.id));
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_PREFERENCES,
          prefDocId,
          { gridLayout }
        );
      } catch (error) {
        console.error('[Bento Store] Selhalo uložení nového rozložení:', error);
      }
    }
  },

  installPlugin: async (manifestUrl, userId) => {
    set({ isLoading: true });
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`Nepodařilo se stáhnout manifest. Status: ${response.status}`);
      }
      
      const manifest = await response.json();
      if (!manifest.id || !manifest.name || !manifest.entrypoint) {
        throw new Error('Nevalidní manifest.json (chybí id, name nebo entrypoint)');
      }

      // Vyřešíme absolutní URL entrypointu vůči URL manifestu
      const entrypointUrl = new URL(manifest.entrypoint, manifestUrl).toString();

      // Vytvoříme záznam o pluginu v Appwrite
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_PLUGINS,
        ID.unique(),
        {
          name: manifest.name,
          description: manifest.description || '',
          url: entrypointUrl,
          icon: manifest.icon || '🧩',
          permissions: JSON.stringify(manifest.permissions || []),
          enabled: true,
        }
      );

      console.log(`[Bento Store] Plugin "${manifest.name}" byl úspěšně nainstalován.`);
      
      // Znovu načteme bento data pro projev v UI
      await get().loadBentoData(userId);
    } catch (error: any) {
      set({ isLoading: false });
      console.error('[Bento Store] Selhala instalace pluginu:', error);
      throw error;
    }
  },

  togglePlugin: async (pluginId, enabled, userId) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_PLUGINS,
        pluginId,
        { enabled }
      );
      await get().loadBentoData(userId);
    } catch (error) {
      console.error('[Bento Store] Selhala změna stavu pluginu:', error);
      throw error;
    }
  },

  uninstallPlugin: async (pluginId, userId) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_PLUGINS,
        pluginId
      );
      
      // Pokud máme uložený layout, odstraníme ID z user_preferences.gridLayout
      const { prefDocId, tiles } = get();
      if (prefDocId) {
        const filteredIds = tiles
          .filter((t) => t.id !== pluginId)
          .map((t) => t.id);
        
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_PREFERENCES,
          prefDocId,
          { gridLayout: JSON.stringify(filteredIds) }
        );
      }

      await get().loadBentoData(userId);
    } catch (error) {
      console.error('[Bento Store] Selhal odinstalování pluginu:', error);
      throw error;
    }
  },
}));
