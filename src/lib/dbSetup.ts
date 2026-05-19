import { databases, storage } from './appwrite';

export const DATABASE_ID = 'canvas-os';
export const COLLECTION_PLUGINS = 'plugins';
export const COLLECTION_PREFERENCES = 'user_preferences';
export const COLLECTION_NOTES = 'notes';
export const COLLECTION_TASKS = 'tasks';
export const COLLECTION_EVENTS = 'calendar_events';
export const COLLECTION_FINANCE = 'finance_transactions';
export const BUCKET_FILES = 'files';

/**
 * Inicializuje a ověřuje dostupnost databázových kolekcí a úložiště v Appwrite.
 * Spouští se automaticky při přihlášení uživatele nebo inicializaci OS.
 */
export async function initializeDatabase() {
  console.log('[Database Bootstrap] Ověřuji spojení s databází Canvas OS...');
  try {
    // Pokusíme se načíst dokumenty z kolekcí pro ověření jejich existence a práv
    await databases.listDocuments(DATABASE_ID, COLLECTION_PLUGINS);
    console.log('[Database Bootstrap] Kolekce "plugins" byla úspěšně ověřena.');
    
    await databases.listDocuments(DATABASE_ID, COLLECTION_PREFERENCES);
    console.log('[Database Bootstrap] Kolekce "user_preferences" byla úspěšně ověřena.');

    // Ověření nových kolekcí z Fáze 3
    try {
      await databases.listDocuments(DATABASE_ID, COLLECTION_NOTES);
      console.log('[Database Bootstrap] Kolekce "notes" byla úspěšně ověřena.');
    } catch (e) {
      console.warn('[Database Bootstrap] Upozornění: Kolekce "notes" není dostupná. Ujistěte se, že existuje v Appwrite.');
    }

    try {
      await databases.listDocuments(DATABASE_ID, COLLECTION_TASKS);
      console.log('[Database Bootstrap] Kolekce "tasks" byla úspěšně ověřena.');
    } catch (e) {
      console.warn('[Database Bootstrap] Upozornění: Kolekce "tasks" není dostupná. Ujistěte se, že existuje v Appwrite.');
    }

    try {
      await databases.listDocuments(DATABASE_ID, COLLECTION_EVENTS);
      console.log('[Database Bootstrap] Kolekce "calendar_events" byla úspěšně ověřena.');
    } catch (e) {
      console.warn('[Database Bootstrap] Upozornění: Kolekce "calendar_events" není dostupná. Ujistěte se, že existuje v Appwrite.');
    }

    try {
      await databases.listDocuments(DATABASE_ID, COLLECTION_FINANCE);
      console.log('[Database Bootstrap] Kolekce "finance_transactions" byla úspěšně ověřena.');
    } catch (e) {
      console.warn('[Database Bootstrap] Upozornění: Kolekce "finance_transactions" není dostupná. Ujistěte se, že existuje v Appwrite.');
    }

    // Ověření Storage Bucket z Fáze 3
    try {
      await storage.listFiles(BUCKET_FILES);
      console.log('[Database Bootstrap] Storage Bucket "files" byl úspěšně ověřen.');
    } catch (e) {
      console.warn('[Database Bootstrap] Upozornění: Storage Bucket "files" není dostupný nebo přístupný. Vytvořte ho v Appwrite.');
    }

  } catch (error: any) {
    console.error(
      '[Database Bootstrap] Varování: Chyba při komunikaci s databázovými kolekcemi.',
      'Ujistěte se, že databáze a kolekce byly správně vytvořeny v konzoli Appwrite a že jsou nastavena oprávnění.',
      error
    );
  }
}
