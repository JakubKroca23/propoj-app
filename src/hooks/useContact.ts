import { useState } from 'react';
import { databases, ID } from '@/lib/appwrite';

const DATABASE_ID = 'propoj-main';
const COLLECTION_ID = 'messages';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const useContact = () => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (data: ContactFormData) => {
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          ...data,
          timestamp: new Date().toISOString(),
        }
      );
      setSuccess(true);
      return true;
    } catch (err: any) {
      console.error('Send Message Error:', err);
      setError(err.message || 'Failed to send message');
      return false;
    } finally {
      setSending(false);
    }
  };

  const resetStatus = () => {
    setSuccess(false);
    setError(null);
  };

  return { sendMessage, sending, success, error, resetStatus };
};
