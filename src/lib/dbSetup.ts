import { databases } from './appwrite';

export const DATABASE_ID = 'canvas-os';
export const COLLECTION_PLUGINS = 'plugins';
export const COLLECTION_PREFERENCES = 'user_preferences';

/**
 * Inicializuje a ověřuje dostupnost databázových kolekcí v Appwrite.
 * Spouští se automaticky při přihlášení uživatele nebo inicializaci OS.
 */
export async function initializeDatabase() {
  console.log('[Database Bootstrap] Ověřuji spojení s databází Canvas OS...');
  try {
    // Pokusíme se načíst dokumenty z obou kolekcí pro ověření jejich existence a práv
    await databases.listDocuments(DATABASE_ID, COLLECTION_PLUGINS);
    console.log('[Database Bootstrap] Kolekce "plugins" byla úspěšně ověřena.');
    
    await databases.listDocuments(DATABASE_ID, COLLECTION_PREFERENCES);
    console.log('[Database Bootstrap] Kolekce "user_preferences" byla úspěšně ověřena.');
  } catch (error: any) {
    console.error(
      '[Database Bootstrap] Varování: Chyba při komunikaci s databázovými kolekcemi.',
      'Ujistěte se, že databáze a kolekce byly správně vytvořeny v konzoli Appwrite a že jsou nastavena oprávnění.',
      error
    );
  }
}
