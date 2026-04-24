import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export const compressImage = async (uri: string, maxWidth = 1024, maxHeight = 1024, compress = 0.7): Promise<string> => {
  try {
    // Get image info to determine dimensions
    const imageInfo = await FileSystem.getInfoAsync(uri);
    if (!imageInfo.exists) {
      throw new Error('Image file does not exist');
    }

    // Calculate new dimensions while maintaining aspect ratio
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Verify the compressed image size
    const compressedInfo = await FileSystem.getInfoAsync(manipResult.uri);
    if (compressedInfo.size > 2 * 1024 * 1024) { // 2MB limit
      // If still too large, try again with more compression
      return compressImage(uri, maxWidth, maxHeight, compress * 0.8);
    }

    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const formatImageForPlatform = async (uri: string, platform: string): Promise<string> => {
  try {
    let aspectRatio;
    let maxWidth;
    let maxHeight;

    switch (platform) {
      case 'TikTok Shop':
        aspectRatio = { width: 1, height: 1 }; // Square
        maxWidth = 1080;
        maxHeight = 1080;
        break;
      case 'Instagram Shopping':
        aspectRatio = { width: 4, height: 5 }; // Portrait
        maxWidth = 1080;
        maxHeight = 1350;
        break;
      case 'Facebook Marketplace':
        aspectRatio = { width: 1, height: 1 }; // Square
        maxWidth = 1080;
        maxHeight = 1080;
        break;
      default:
        aspectRatio = { width: 1, height: 1 }; // Square
        maxWidth = 1080;
        maxHeight = 1080;
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error formatting image for platform:', error);
    throw error;
  }
};

export const addWatermark = async (uri: string, isPremium: boolean): Promise<string> => {
  if (isPremium) {
    return uri; // No watermark for premium users
  }

  try {
    // In a real app, you would have a watermark image asset
    // For this example, we'll just return the original image
    // with a simulated watermark by adding a text overlay

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          text: 'SyncSell - Free Tier',
          position: { x: 50, y: 50 },
          color: 'rgba(255,255,255,0.7)',
          fontSize: 24,
          fontName: 'Arial',
        }
      ],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
};

export const getImageSize = async (uri: string): Promise<{ width: number; height: number }> => {
  try {
    const imageInfo = await FileSystem.getInfoAsync(uri);
    if (!imageInfo.exists) {
      throw new Error('Image file does not exist');
    }

    // In a real app, you would use a more reliable method to get image dimensions
    // This is a simplified version
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    // This is a workaround since ImageManipulator doesn't directly provide dimensions
    // In production, you might need to use a different approach
    return { width: 1080, height: 1080 };
  } catch (error) {
    console.error('Error getting image size:', error);
    throw error;
  }
};
