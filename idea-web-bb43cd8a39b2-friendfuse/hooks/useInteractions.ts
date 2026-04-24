import { useState, useEffect } from 'react';
import { openDatabase } from '../lib/database';
import { Interaction } from '../types';

const db = openDatabase();

export const useInteractions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInteractions = async () => {
      try {
        const result = await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM interactions',
              [],
              (_, { rows }) => resolve(rows._array),
              (_, error) => reject(error)
            );
          });
        });
        setInteractions(result as Interaction[]);
      } catch (error) {
        console.error('Error loading interactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInteractions();
  }, []);

  const addInteraction = async (interaction: Omit<Interaction, 'id'>) => {
    try {
      await new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO interactions (friend_id, type, timestamp, notes) VALUES (?, ?, ?, ?)',
            [interaction.friend_id, interaction.type, interaction.timestamp, interaction.notes],
            (_, result) => {
              const newInteraction = {
                id: result.insertId,
                ...interaction
              };
              setInteractions(prev => [...prev, newInteraction]);
              resolve(result);
            },
            (_, error) => reject(error)
          );
        });
      });
    } catch (error) {
      console.error('Error adding interaction:', error);
      throw error;
    }
  };

  return { interactions, loading, addInteraction };
};
