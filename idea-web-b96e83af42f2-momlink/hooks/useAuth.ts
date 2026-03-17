import { useState, useEffect } from 'react';
import { getUserId } from '../lib/auth';
import { getUser } from '../lib/db';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userId = await getUserId();
      if (userId) {
        const userData = await getUser(userId);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, refreshUser: loadUser };
}
