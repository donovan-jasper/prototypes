import { computeImageHash, compareHashes } from '../utils/imageHash';
import { getAllMedia, updateMediaHash } from '../database/queries';

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
  similarity: number;
}

export const findDuplicates = async (similarityThreshold = 0.9): Promise<DuplicateGroup[]> => {
  try {
    const allMedia = await getAllMedia();
    const duplicateGroups: DuplicateGroup[] = [];

    // Compare all pairs of media items
    for (let i = 0; i < allMedia.length; i++) {
      for (let j = i + 1; j < allMedia.length; j++) {
        const item1 = allMedia[i];
        const item2 = allMedia[j];

        // Skip if either item doesn't have a hash
        if (!item1.hash || !item2.hash) continue;

        const similarity = compareHashes(item1.hash, item2.hash);

        if (similarity >= similarityThreshold) {
          // Check if this pair is already in a group
          let groupFound = false;
          for (const group of duplicateGroups) {
            if (group.matches.some(m => m.id === item1.id || m.id === item2.id)) {
              // Add to existing group if not already present
              if (!group.matches.some(m => m.id === item1.id)) {
                group.matches.push(item1);
              }
              if (!group.matches.some(m => m.id === item2.id)) {
                group.matches.push(item2);
              }
              groupFound = true;
              break;
            }
          }

          // Create new group if not found
          if (!groupFound) {
            duplicateGroups.push({
              hash: item1.hash,
              matches: [item1, item2],
              similarity
            });
          }
        }
      }
    }

    return duplicateGroups;
  } catch (error) {
    console.error('Error finding duplicates:', error);
    return [];
  }
};

export const computeAndStoreHashes = async (mediaItems: MediaItem[]): Promise<MediaItem[]> => {
  const updatedItems: MediaItem[] = [];

  for (const item of mediaItems) {
    try {
      // Only compute hash if we don't have one already
      if (!item.hash) {
        const hash = await computeImageHash(item.localPath);
        await updateMediaHash(item.id, hash);
        updatedItems.push({ ...item, hash });
      } else {
        updatedItems.push(item);
      }
    } catch (error) {
      console.error(`Error computing hash for ${item.localPath}:`, error);
      updatedItems.push(item); // Keep original if hash fails
    }
  }

  return updatedItems;
};
