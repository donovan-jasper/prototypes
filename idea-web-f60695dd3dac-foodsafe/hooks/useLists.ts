import { useState, useEffect, useCallback } from 'react';
import { UserList } from '@/types';
import {
  createUserList,
  getUserLists,
  addRestaurantToList,
  removeRestaurantFromList,
} from '@/services/database';

interface UseListsResult {
  lists: UserList[];
  isLoading: boolean;
  error: string | null;
  createList: (name: string) => Promise<UserList>;
  addRestaurantToList: (listId: string, restaurantId: string) => Promise<void>;
  removeRestaurantFromList: (listId: string, restaurantId: string) => Promise<void>;
  refreshLists: () => Promise<void>;
}

export const useLists = (): UseListsResult => {
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load lists from database
  const loadLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userLists = await getUserLists();
      setLists(userLists);
    } catch (err) {
      console.error('Error loading lists:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new list
  const createList = useCallback(async (name: string): Promise<UserList> => {
    try {
      const newList = await createUserList(name);
      setLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      console.error('Error creating list:', err);
      throw err;
    }
  }, []);

  // Add restaurant to a list
  const addToList = useCallback(async (listId: string, restaurantId: string): Promise<void> => {
    try {
      await addRestaurantToList(listId, restaurantId);
      // Update the local state
      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            restaurantIds: [...list.restaurantIds, restaurantId],
          };
        }
        return list;
      }));
    } catch (err) {
      console.error('Error adding restaurant to list:', err);
      throw err;
    }
  }, []);

  // Remove restaurant from a list
  const removeFromList = useCallback(async (listId: string, restaurantId: string): Promise<void> => {
    try {
      await removeRestaurantFromList(listId, restaurantId);
      // Update the local state
      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            restaurantIds: list.restaurantIds.filter(id => id !== restaurantId),
          };
        }
        return list;
      }));
    } catch (err) {
      console.error('Error removing restaurant from list:', err);
      throw err;
    }
  }, []);

  // Refresh lists
  const refreshLists = useCallback(async () => {
    await loadLists();
  }, [loadLists]);

  // Load lists on initial render
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  return {
    lists,
    isLoading,
    error,
    createList,
    addRestaurantToList: addToList,
    removeRestaurantFromList: removeFromList,
    refreshLists,
  };
};
