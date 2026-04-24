import { Linking } from 'react-native';

export function generateShareLink(shelfId: number): string {
  // In a real app, this would generate a signed URL with expiration
  return `https://shelflife.app/share/${shelfId}?token=abc123`;
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
