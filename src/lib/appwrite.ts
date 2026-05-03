import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://appwrite.propoj.app/v1';
// Use provided project ID if set, otherwise fall back differently in DEV vs PROD
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || (import.meta.env.DEV ? '69effdf6003ce697ee83' : 'propoj-app');

// Debug info (dev only)
if (import.meta.env.DEV) {
  // Do not expose in production
  console.debug(`Appwrite config: endpoint=${endpoint}, projectId=${projectId}`);
}

client
    .setEndpoint(endpoint) 
    .setProject(projectId); 

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID } from 'appwrite';
