import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import type { Models } from 'appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(loading);
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      await account.createEmailPasswordSession(email, pass);
    } catch (err: any) {
      // Handle case where a session already exists
      if (err?.message?.includes('Creation of a session is prohibited when a session is active')) {
        try {
          await account.deleteSession('current');
        } catch (_) {
          // ignore errors during forced logout
        }
        // Retry once after clearing existing session
        await account.createEmailPasswordSession(email, pass);
      } else {
        throw err;
      }
    }
    await checkUser();
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
