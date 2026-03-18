import { useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { useItemsStore } from '../lib/store/items';
import { useUserStore, FREE_TIER_LIMITS } from '../lib/store/user';

export const useItems = (shelfId: number) => {
  const { isReady, itemQueries } = useDatabase();
  const { items, loading, error, setItems, addItem, updateItem, deleteItem, moveItem, setLoading, setError } = useItemsStore();
  const { isPremium } = useUserStore();

  const shelfItems = items[shelfId] || [];

  useEffect(() => {
    if (isReady && itemQueries && shelfId) {
      loadItems();
    }
  }, [isReady, shelfId]);

  const loadItems = async () => {
    if (!itemQueries) return;
    
    try {
      setLoading(true);
      const data = await itemQueries.getItems(shelfId);
      setItems(shelfId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    }
  };

  const createItem = async (
    url: string,
    metadata: {
      title: string;
      description?: string;
      image_url?: string;
      favicon_url?: string;
      tags?: string;
    }
  ) => {
    if (!itemQueries) throw new Error('Database not ready');

    if (!isPremium && shelfItems.length >= FREE_TIER_LIMITS.MAX_ITEMS_PER_SHELF) {
      throw new Error('FREE_TIER_LIMIT');
    }

    try {
      const id = await itemQueries.createItem(shelfId, url, metadata);
      const newItem = await itemQueries.getItem(id);
      if (newItem) {
        addItem(shelfId, newItem);
      }
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      throw err;
    }
  };

  const editItem = async (id: number, data: Partial<{ title: string; description: string; image_url: string; tags: string }>) => {
    if (!itemQueries) throw new Error('Database not ready');

    try {
      await itemQueries.updateItem(id, data);
      updateItem(shelfId, id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  };

  const removeItem = async (id: number) => {
    if (!itemQueries) throw new Error('Database not ready');

    try {
      await itemQueries.deleteItem(id);
      deleteItem(shelfId, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  const moveItemToShelf = async (itemId: number, toShelfId: number) => {
    if (!itemQueries) throw new Error('Database not ready');

    try {
      await itemQueries.moveItem(itemId, toShelfId);
      moveItem(itemId, shelfId, toShelfId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move item');
      throw err;
    }
  };

  return {
    items: shelfItems,
    loading,
    error,
    createItem,
    editItem,
    removeItem,
    moveItemToShelf,
    refresh: loadItems,
  };
};
