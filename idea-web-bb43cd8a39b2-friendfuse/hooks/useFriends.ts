import { useState, useEffect } from 'react';
import { openDatabase } from '../lib/database';

const db = openDatabase();

export const useFriends = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const result = await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM friends',
              [],
              (_, { rows }) => resolve(rows._array),
              (_, error) => reject(error)
            );
          });
        });
        setFriends(result as any[]);
      } catch (error) {
        console.error('Error loading friends:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  const addFriend = async (friend: any) => {
    try {
      await new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO friends (name, avatar, created_at) VALUES (?, ?, ?)',
            [friend.name, friend.avatar, new Date().toISOString()],
            (_, result) => {
              const newFriend = {
                id: result.insertId,
                ...friend,
                created_at: new Date().toISOString()
              };
              setFriends(prev => [...prev, newFriend]);
              resolve(result);
            },
            (_, error) => reject(error)
          );
        });
      });
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  };

  return { friends, loading, addFriend };
};
