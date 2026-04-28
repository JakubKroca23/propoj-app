import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://appwrite.propoj.app/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'propoj-app';

client
    .setEndpoint(endpoint) 
    .setProject(projectId); 

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID } from 'appwrite';

