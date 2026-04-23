import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { Relationship, RelationshipWithHealth } from '../types';
import { calculateHealth } from '../services/relationshipService';

const db = SQLite.openDatabase('kinkeeper.db');

export const useRelationships = () => {
  const [relationships, setRelationships] = useState<RelationshipWithHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all relationships from the database
      const relationshipsResult = await new Promise<Relationship[]>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM relationships ORDER BY name COLLATE NOCASE',
            [],
            (_, { rows }) => resolve(rows._array as Relationship[]),
            (_, error) => reject(error)
          );
        });
      });

      // For each relationship, get the last interaction and calculate health
      const relationshipsWithHealth = await Promise.all(
        relationshipsResult.map(async (relationship) => {
          const lastInteraction = await new Promise<{ timestamp: string } | null>((resolve, reject) => {
            db.transaction(tx => {
              tx.executeSql(
                'SELECT timestamp FROM interactions WHERE relationshipId = ? ORDER BY timestamp DESC LIMIT 1',
                [relationship.id],
                (_, { rows }) => resolve(rows._array[0] || null),
                (_, error) => reject(error)
              );
            });
          });

          return {
            ...relationship,
            health: calculateHealth(relationship, lastInteraction?.timestamp || null)
          };
        })
      );

      setRelationships(relationshipsWithHealth);
    } catch (err) {
      console.error('Error fetching relationships:', err);
      setError('Failed to load relationships');
    } finally {
      setLoading(false);
    }
  }, []);

  const addRelationship = useCallback(async (relationshipData: Omit<Relationship, 'id'>) => {
    try {
      const newRelationship = await new Promise<Relationship>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO relationships (name, category, frequency, importance, createdAt) VALUES (?, ?, ?, ?, ?)',
            [relationshipData.name, relationshipData.category, relationshipData.frequency, relationshipData.importance, new Date().toISOString()],
            (_, result) => {
              resolve({
                ...relationshipData,
                id: result.insertId
              });
            },
            (_, error) => reject(error)
          );
        });
      });

      // Calculate health for the new relationship
      const relationshipWithHealth = {
        ...newRelationship,
        health: calculateHealth(newRelationship, null)
      };

      setRelationships(prev => [...prev, relationshipWithHealth]);
      return relationshipWithHealth;
    } catch (err) {
      console.error('Error adding relationship:', err);
      setError('Failed to add relationship');
      throw err;
    }
  }, []);

  const updateRelationship = useCallback(async (id: number, updates: Partial<Relationship>) => {
    try {
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          const setClause = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(', ');

          const values = [...Object.values(updates), id];

          tx.executeSql(
            `UPDATE relationships SET ${setClause} WHERE id = ?`,
            values,
            () => resolve(),
            (_, error) => reject(error)
          );
        });
      });

      // Refresh the relationships list
      await fetchRelationships();
    } catch (err) {
      console.error('Error updating relationship:', err);
      setError('Failed to update relationship');
      throw err;
    }
  }, [fetchRelationships]);

  const deleteRelationship = useCallback(async (id: number) => {
    try {
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          // First delete all interactions for this relationship
          tx.executeSql(
            'DELETE FROM interactions WHERE relationshipId = ?',
            [id],
            () => {
              // Then delete the relationship itself
              tx.executeSql(
                'DELETE FROM relationships WHERE id = ?',
                [id],
                () => resolve(),
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        });
      });

      // Remove from state
      setRelationships(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting relationship:', err);
      setError('Failed to delete relationship');
      throw err;
    }
  }, []);

  // Fetch relationships on initial load
  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  return {
    relationships,
    loading,
    error,
    fetchRelationships,
    addRelationship,
    updateRelationship,
    deleteRelationship
  };
};
