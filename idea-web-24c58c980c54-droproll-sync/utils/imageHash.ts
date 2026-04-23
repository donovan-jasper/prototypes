import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

const IMAGE_SIZE = 32; // Size to resize images to for hashing
const HASH_SIZE = 8; // Size of the resulting hash (8x8 grid)

export const computeImageHash = async (fileUri: string): Promise<string> => {
  try {
    // Read image file
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) throw new Error('File does not exist');

    // Create a temporary resized image
    const resizedUri = `${FileSystem.cacheDirectory}resized_${Date.now()}.jpg`;

    // Resize image (simplified - in a real app you'd use a proper image processing library)
    // This is a placeholder - in production you'd use a library like react-native-image-resizer
    await FileSystem.copyAsync({
      from: fileUri,
      to: resizedUri,
    });

    // Get image dimensions
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
      Image.getSize(resizedUri, (width, height) => resolve({ width, height }));
    });

    // Calculate average color for each block
    const blockSize = Math.max(1, Math.floor(Math.max(width, height) / HASH_SIZE));
    const hash: number[] = [];

    // This is a simplified version - a real implementation would:
    // 1. Convert to grayscale
    // 2. Calculate average brightness for each block
    // 3. Compare with overall average to create binary hash
    // This is just a placeholder to demonstrate the concept
    for (let i = 0; i < HASH_SIZE * HASH_SIZE; i++) {
      // In a real implementation, you would:
      // 1. Get the pixel data for the current block
      // 2. Calculate the average brightness
      // 3. Compare with the overall average to get a 0 or 1
      hash.push(Math.random() > 0.5 ? 1 : 0);
    }

    // Convert binary array to hex string
    let hexString = '';
    for (let i = 0; i < hash.length; i += 4) {
      const chunk = hash.slice(i, i + 4);
      const decimal = chunk.reduce((acc, val, idx) => acc + (val << (3 - idx)), 0);
      hexString += decimal.toString(16).padStart(1, '0');
    }

    // Clean up temporary file
    await FileSystem.deleteAsync(resizedUri, { idempotent: true });

    return hexString;
  } catch (error) {
    console.error('Error computing image hash:', error);
    throw error;
  }
};

export const compareHashes = (hash1: string, hash2: string): number => {
  // Convert hex strings to binary arrays
  const binary1 = hexToBinary(hash1);
  const binary2 = hexToBinary(hash2);

  if (binary1.length !== binary2.length) {
    throw new Error('Hashes must be of equal length');
  }

  // Calculate Hamming distance
  let distance = 0;
  for (let i = 0; i < binary1.length; i++) {
    if (binary1[i] !== binary2[i]) {
      distance++;
    }
  }

  // Return similarity score (0-1)
  return 1 - distance / binary1.length;
};

const hexToBinary = (hex: string): number[] => {
  const binary: number[] = [];
  for (const char of hex) {
    const decimal = parseInt(char, 16);
    for (let i = 3; i >= 0; i--) {
      binary.push((decimal >> i) & 1);
    }
  }
  return binary;
};
