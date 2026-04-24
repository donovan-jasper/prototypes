import { useState, useEffect } from 'react';
import { openDatabase } from '../lib/database';
import { Challenge } from '../types';

const db = openDatabase();

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const result = await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM challenges',
              [],
              (_, { rows }) => resolve(rows._array),
              (_, error) => reject(error)
            );
          });
        });
        setChallenges(result as Challenge[]);
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const addChallenge = async (challenge: Omit<Challenge, 'id'>) => {
    try {
      await new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO challenges (friend_id, title, description, status, created_at) VALUES (?, ?, ?, ?, ?)',
            [challenge.friend_id, challenge.title, challenge.description, challenge.status, new Date().toISOString()],
            (_, result) => {
              const newChallenge = {
                id: result.insertId,
                ...challenge,
                created_at: new Date().toISOString()
              };
              setChallenges(prev => [...prev, newChallenge]);
              resolve(result);
            },
            (_, error) => reject(error)
          );
        });
      });
    } catch (error) {
      console.error('Error adding challenge:', error);
      throw error;
    }
  };

  return { challenges, loading, addChallenge };
};
