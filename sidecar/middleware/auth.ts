import { Client, Account } from 'node-appwrite';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const jwt = authHeader.split(' ')[1];
  const client = new Client();
  
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
  const project = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;

  if (!endpoint || !project) {
    console.error('Appwrite config missing in environment');
    return res.status(500).json({ error: 'Internal server configuration error' });
  }

  client
    .setEndpoint(endpoint)
    .setProject(project)
    .setJWT(jwt);

  const account = new Account(client);

  try {
    const user = await account.get();
    
    // Check if user is the admin
    if (user.$id !== process.env.ADMIN_USER_ID) {
      console.warn(`Unauthorized access attempt by user: ${user.$id}`);
      return res.status(403).json({ error: 'Forbidden: You are not authorized to access this API' });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired JWT' });
  }
};
