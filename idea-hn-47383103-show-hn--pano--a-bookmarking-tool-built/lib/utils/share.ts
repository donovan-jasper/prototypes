import { Linking } from 'react-native';
import { useShelvesStore } from '../store/shelves';
import { useItemsStore } from '../store/items';
import { ShelfQueries, ItemQueries } from '../db/queries';
import { initDatabase } from '../db/init';

export function generateShareLink(shelfId: number): string {
  // In a real app, this would generate a signed URL with expiration
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `https://shelflife.app/share/${shelfId}?token=${token}`;
}

export function parseShareLink(url: string): boolean {
  // Basic validation - in a real app, this would verify the token
  const regex = /^https:\/\/shelflife\.app\/share\/(\d+)\?token=([a-zA-Z0-9]+)$/;
  return regex.test(url);
}

export async function shareShelf(shelfId: number, shelfName: string): Promise<void> {
  const shareLink = generateShareLink(shelfId);

  try {
    await Linking.openURL(`mailto:?subject=Check out my ShelfLife shelf: ${shelfName}&body=I've shared a shelf with you: ${shareLink}`);
  } catch (error) {
    console.error('Error sharing shelf:', error);
    throw error;
  }
}

export async function cloneShelf(shelfId: number, userId: string): Promise<void> {
  const db = await initDatabase();
  const shelfQueries = new ShelfQueries(db);
  const itemQueries = new ItemQueries(db);

  // Get the original shelf and items
  const originalShelf = await shelfQueries.getShelf(shelfId);
  const originalItems = await itemQueries.getItems(shelfId);

  if (!originalShelf) {
    throw new Error('Shelf not found');
  }

  // Create a new shelf for the user
  const newShelfId = await shelfQueries.createShelf(
    `${originalShelf.name} (Copy)`,
    originalShelf.description || undefined
  );

  // Copy all items to the new shelf
  for (const item of originalItems) {
    await itemQueries.createItem(
      newShelfId,
      item.url,
      {
        title: item.title,
        description: item.description || undefined,
        image_url: item.image_url || undefined,
        favicon_url: item.favicon_url || undefined,
        tags: item.tags || undefined,
      }
    );
  }

  // Update Zustand stores
  const shelvesStore = useShelvesStore.getState();
  const itemsStore = useItemsStore.getState();

  // Refresh shelves and items
  const updatedShelves = await shelfQueries.getShelves();
  shelvesStore.setShelves(updatedShelves);

  if (originalItems.length > 0) {
    const updatedItems = await itemQueries.getItems(newShelfId);
    itemsStore.setItems(newShelfId, updatedItems);
  }
}

export async function trackShelfView(shelfId: number): Promise<number> {
  // In a real app, this would call an API to track the view
  // and return the updated view count
  console.log(`Tracking view for shelf ${shelfId}`);

  // Simulate getting the view count
  // In a real implementation, this would fetch from a database or API
  return Math.floor(Math.random() * 100) + 1;
}
