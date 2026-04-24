import { Linking } from 'react-native';
import { useShelvesStore } from '../store/shelves';
import { useItemsStore } from '../store/items';

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
  const shelvesStore = useShelvesStore.getState();
  const itemsStore = useItemsStore.getState();

  // Get the original shelf and items
  const originalShelf = await shelvesStore.getShelf(shelfId);
  const originalItems = await itemsStore.getItems(shelfId);

  if (!originalShelf) {
    throw new Error('Shelf not found');
  }

  // Create a new shelf for the user
  const newShelfId = await shelvesStore.createShelf({
    name: `${originalShelf.name} (Copy)`,
    description: originalShelf.description,
    coverImage: originalShelf.coverImage,
    userId: userId,
  });

  // Copy all items to the new shelf
  for (const item of originalItems) {
    await itemsStore.createItem({
      shelfId: newShelfId,
      url: item.url,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      faviconUrl: item.faviconUrl,
      tags: item.tags,
    });
  }
}

export async function trackShelfView(shelfId: number): Promise<number> {
  // In a real app, this would call an API to track the view
  // and return the updated view count
  console.log(`Tracking view for shelf ${shelfId}`);

  // Simulate getting the view count
  return Math.floor(Math.random() * 100) + 1;
}
