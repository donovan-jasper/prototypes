import { useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { useShelvesStore } from '../lib/store/shelves';
import { useUserStore, FREE_TIER_LIMITS } from '../lib/store/user';

export const useShelves = () => {
  const { isReady, shelfQueries } = useDatabase();
  const { shelves, loading, error, setShelves, addShelf, updateShelf, deleteShelf, reorderShelves, setLoading, setError } = useShelvesStore();
  const { isPremium } = useUserStore();

  useEffect(() => {
    if (isReady && shelfQueries) {
      loadShelves();
    }
  }, [isReady]);

  const loadShelves = async () => {
    if (!shelfQueries) return;
    
    try {
      setLoading(true);
      const data = await shelfQueries.getShelves();
      setShelves(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shelves');
    }
  };

  const createShelf = async (name: string, description?: string) => {
    if (!shelfQueries) throw new Error('Database not ready');

    if (!isPremium && shelves.length >= FREE_TIER_LIMITS.MAX_SHELVES) {
      throw new Error('FREE_TIER_LIMIT');
    }

    try {
      const id = await shelfQueries.createShelf(name, description);
      const newShelf = await shelfQueries.getShelf(id);
      if (newShelf) {
        addShelf(newShelf);
      }
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shelf');
      throw err;
    }
  };

  const editShelf = async (id: number, data: { name?: string; description?: string; cover_image?: string }) => {
    if (!shelfQueries) throw new Error('Database not ready');

    try {
      await shelfQueries.updateShelf(id, data);
      updateShelf(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shelf');
      throw err;
    }
  };

  const removeShelf = async (id: number) => {
    if (!shelfQueries) throw new Error('Database not ready');

    try {
      await shelfQueries.deleteShelf(id);
      deleteShelf(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shelf');
      throw err;
    }
  };

  const reorder = async (shelfIds: number[]) => {
    if (!shelfQueries) throw new Error('Database not ready');

    try {
      await shelfQueries.reorderShelves(shelfIds);
      reorderShelves(shelfIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder shelves');
      throw err;
    }
  };

  return {
    shelves,
    loading,
    error,
    createShelf,
    editShelf,
    removeShelf,
    reorder,
    refresh: loadShelves,
  };
};
