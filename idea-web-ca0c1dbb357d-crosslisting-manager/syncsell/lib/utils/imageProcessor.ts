import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const compressImage = async (uri: string): Promise<string> => {
  try {
    // Get image info to determine dimensions
    const imageInfo = await FileSystem.getInfoAsync(uri);
    if (!imageInfo.exists) {
      throw new Error('Image file does not exist');
    }

    // Calculate new dimensions to maintain aspect ratio but reduce size
    const maxWidth = 1024;
    const maxHeight = 1024;

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: false }
    );

    // Verify the file size is under 2MB
    const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
    if (fileInfo.size > 2 * 1024 * 1024) {
      // If still too large, compress further
      const furtherCompressed = await ImageManipulator.manipulateAsync(
        manipResult.uri,
        [],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: false }
      );
      return furtherCompressed.uri;
    }

    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const formatImageForPlatform = async (uri: string, platform: string): Promise<string> => {
  try {
    let aspectRatio = { width: 1024, height: 1024 }; // Default square

    switch (platform) {
      case 'TikTok Shop':
        // TikTok prefers square images
        aspectRatio = { width: 1024, height: 1024 };
        break;
      case 'Instagram Shopping':
        // Instagram prefers portrait images
        aspectRatio = { width: 1080, height: 1350 };
        break;
      case 'Facebook Marketplace':
        // Facebook prefers square images
        aspectRatio = { width: 1024, height: 1024 };
        break;
      default:
        aspectRatio = { width: 1024, height: 1024 };
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: aspectRatio }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: false }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error formatting image for platform:', error);
    throw error;
  }
};

export const addWatermark = async (uri: string, isPremium: boolean): Promise<string> => {
  if (isPremium) {
    // Premium users don't get watermarks
    return uri;
  }

  try {
    // Create a watermark text
    const watermarkText = 'SyncSell - Free Tier';

    // Add watermark to the image
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          text: watermarkText,
          position: { x: 50, y: 50 },
          fontSize: 30,
          color: 'rgba(255,255,255,0.7)',
          shadow: {
            color: 'black',
            offset: { width: 2, height: 2 },
            blur: 3,
          },
        },
      ],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: false }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error adding watermark:', error);
    // Return original image if watermark fails
    return uri;
  }
};
