import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const IMAGE_SIZE = 9; // 8x8 grid + 1 for comparison
const HASH_SIZE = 8; // 8x8 grid

export const computeImageHash = async (fileUri: string): Promise<string> => {
  try {
    // Read image file
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) throw new Error('File does not exist');

    // Resize and convert to grayscale
    const manipulatorResult = await ImageManipulator.manipulateAsync(
      fileUri,
      [{ resize: { width: IMAGE_SIZE, height: IMAGE_SIZE } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    // Get pixel data
    const base64Data = manipulatorResult.base64;
    if (!base64Data) throw new Error('Failed to get image data');

    // Convert base64 to pixel array
    const pixels = await getPixelsFromBase64(base64Data);

    // Calculate dHash
    const hash = [];
    for (let y = 0; y < HASH_SIZE; y++) {
      for (let x = 0; x < HASH_SIZE; x++) {
        const currentIndex = y * IMAGE_SIZE + x;
        const nextIndex = y * IMAGE_SIZE + (x + 1);

        // Compare adjacent pixels
        if (currentIndex < pixels.length && nextIndex < pixels.length) {
          const currentPixel = pixels[currentIndex];
          const nextPixel = pixels[nextIndex];
          hash.push(currentPixel < nextPixel ? 1 : 0);
        }
      }
    }

    // Convert binary array to hex string
    let hexString = '';
    for (let i = 0; i < hash.length; i += 4) {
      const chunk = hash.slice(i, i + 4);
      const decimal = chunk.reduce((acc, val, idx) => acc + (val << (3 - idx)), 0);
      hexString += decimal.toString(16).padStart(1, '0');
    }

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

// Helper function to get pixel data from base64 image
const getPixelsFromBase64 = async (base64Data: string): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = [];

      // Convert to grayscale and get brightness values
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const brightness = (r + g + b) / 3;
        pixels.push(brightness);
      }

      resolve(pixels);
    };
    img.onerror = reject;
    img.src = `data:image/jpeg;base64,${base64Data}`;
  });
};
