import { computeImageHash, compareHashes } from '../utils/imageHash';
import { getAllMedia } from '../database/queries';

interface MediaItem {
  id: string;
  localPath: string;
  source: string;
  hash: string;
  cloudId: string;
}

interface DuplicateGroup {
  hash: string;
  matches: MediaItem[];
}

export const findDuplicates = async (): Promise<DuplicateGroup[]> => {
  try {
    const allMedia = await getAllMedia();
    const hashMap: Record<string, MediaItem[]> = {};

    // Group media by hash
    for (const item of allMedia) {
      if (!hashMap[item.hash]) {
        hashMap[item.hash] = [];
      }
      hashMap[item.hash].push(item);
    }

    // Filter groups with multiple items (duplicates)
    const duplicates = Object.entries(hashMap)
      .filter(([_, items]) => items.length > 1)
      .map(([hash, items]) => ({
        hash,
        matches: items,
      }));

    return duplicates;
  } catch (error) {
    console.error('Error finding duplicates:', error);
    return [];
  }
};

export const computeAndStoreHashes = async (mediaItems: MediaItem[]): Promise<MediaItem[]> => {
  const updatedItems: MediaItem[] = [];

  for (const item of mediaItems) {
    try {
      const hash = await computeImageHash(item.localPath);
      updatedItems.push({ ...item, hash });
    } catch (error) {
      console.error(`Error computing hash for ${item.localPath}:`, error);
      updatedItems.push(item); // Keep original if hash fails
    }
  }

  return updatedItems;
};
