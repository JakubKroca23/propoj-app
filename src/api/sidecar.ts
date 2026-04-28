import { account } from '@/lib/appwrite';

const SIDECAR_URL = import.meta.env.VITE_SIDECAR_URL || 'http://localhost:3001';

export const fetchDockerStats = async () => {
  try {
    const jwtResponse = await account.createJWT();
    const response = await fetch(`${SIDECAR_URL}/api/stats`, {
      headers: {
        'Authorization': `Bearer ${jwtResponse.jwt}`
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized access to sidecar');
      }
      throw new Error('Failed to fetch stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch Stats Error:', error);
    throw error;
  }
};
export const executeTerminalCommand = async (command: string) => {
  try {
    const jwtResponse = await account.createJWT();
    const response = await fetch(`${SIDECAR_URL}/api/terminal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtResponse.jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command })
    });

    return await response.json();
  } catch (error) {
    console.error('Terminal Execution Error:', error);
    throw error;
  }
};
