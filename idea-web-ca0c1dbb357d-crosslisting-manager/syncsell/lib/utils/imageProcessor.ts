import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

export const compressImage = async (uri: string): Promise<string> => {
  try {
    // Get image info to determine dimensions
    const imageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Further compress if needed
    if (imageInfo.width > 1000 || imageInfo.height > 1000) {
      const resizeRatio = Math.min(1000 / imageInfo.width, 1000 / imageInfo.height);
      const newWidth = Math.round(imageInfo.width * resizeRatio);
      const newHeight = Math.round(imageInfo.height * resizeRatio);

      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: newWidth, height: newHeight } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      return resizedImage.uri;
    }

    return imageInfo.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original if compression fails
  }
};

export const formatImageForPlatform = async (uri: string, platform: string): Promise<string> => {
  try {
    const imageInfo = await ImageManipulator.manipulateAsync(uri, [], { compress: 1 });

    let aspectRatio = 1; // Default square

    switch (platform.toLowerCase()) {
      case 'tiktok':
        aspectRatio = 1; // Square
        break;
      case 'instagram':
        aspectRatio = 4/5; // Portrait
        break;
      case 'facebook':
        aspectRatio = 16/9; // Landscape
        break;
      default:
        aspectRatio = 1;
    }

    // Calculate new dimensions while maintaining aspect ratio
    let newWidth, newHeight;

    if (imageInfo.width / imageInfo.height > aspectRatio) {
      // Image is wider than target aspect ratio
      newHeight = imageInfo.height;
      newWidth = Math.round(newHeight * aspectRatio);
    } else {
      // Image is taller than target aspect ratio
      newWidth = imageInfo.width;
      newHeight = Math.round(newWidth / aspectRatio);
    }

    // Crop the image to the target aspect ratio
    const croppedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{
        crop: {
          originX: Math.max(0, Math.round((imageInfo.width - newWidth) / 2)),
          originY: Math.max(0, Math.round((imageInfo.height - newHeight) / 2)),
          width: newWidth,
          height: newHeight
        }
      }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    return croppedImage.uri;
  } catch (error) {
    console.error('Error formatting image for platform:', error);
    return uri; // Return original if formatting fails
  }
};

export const addWatermark = async (uri: string): Promise<string> => {
  const { isPremium } = useAuthStore.getState();

  if (isPremium) {
    return uri; // No watermark for premium users
  }

  try {
    // Create a watermark image (in a real app, you'd have an actual watermark image)
    const watermarkText = 'SyncSell';
    const watermarkUri = await createWatermarkImage(watermarkText);

    // Composite the watermark onto the original image
    const watermarkedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{
        overlay: {
          uri: watermarkUri,
          position: { x: 20, y: 20 },
          size: { width: 100, height: 50 }
        }
      }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Clean up the temporary watermark image
    await FileSystem.deleteAsync(watermarkUri, { idempotent: true });

    return watermarkedImage.uri;
  } catch (error) {
    console.error('Error adding watermark:', error);
    return uri; // Return original if watermarking fails
  }
};

const createWatermarkImage = async (text: string): Promise<string> => {
  // In a real app, you would create an actual image with the watermark text
  // This is a simplified version that just creates a blank image
  const width = 200;
  const height = 100;

  const image = await ImageManipulator.manipulateAsync(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    [{
      resize: { width, height }
    }],
    { format: ImageManipulator.SaveFormat.PNG }
  );

  return image.uri;
};

export const saveImageToDevice = async (uri: string): Promise<string> => {
  try {
    const fileName = `syncsell-${Date.now()}.jpg`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: uri,
      to: filePath,
    });

    return filePath;
  } catch (error) {
    console.error('Error saving image to device:', error);
    throw error;
  }
};
