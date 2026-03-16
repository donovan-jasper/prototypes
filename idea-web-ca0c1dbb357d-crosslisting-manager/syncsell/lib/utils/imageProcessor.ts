import * as ImageManipulator from 'expo-image-manipulator';

export const compressImage = async (uri, maxWidth = 1024, maxHeight = 1024, compress = 0.7) => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const formatImageForPlatform = async (uri, platform) => {
  try {
    let aspectRatio;
    switch (platform) {
      case 'TikTok Shop':
        aspectRatio = { width: 1, height: 1 }; // Square
        break;
      case 'Instagram Shopping':
        aspectRatio = { width: 4, height: 5 }; // Portrait
        break;
      case 'Facebook Marketplace':
        aspectRatio = { width: 1, height: 1 }; // Square
        break;
      default:
        aspectRatio = { width: 1, height: 1 }; // Square
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024, height: 1024 * aspectRatio.height / aspectRatio.width } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error formatting image for platform:', error);
    throw error;
  }
};

export const addWatermark = async (uri, isPremium) => {
  if (isPremium) {
    return uri; // No watermark for premium users
  }

  try {
    const watermarkUri = 'path/to/watermark.png'; // Replace with actual watermark path
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024, height: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    const watermarkResult = await ImageManipulator.manipulateAsync(
      watermarkUri,
      [{ resize: { width: 200, height: 200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.PNG }
    );

    const finalResult = await ImageManipulator.manipulateAsync(
      manipResult.uri,
      [
        {
          source: watermarkResult.uri,
          resize: { width: 200, height: 200 },
          position: { x: 800, y: 800 },
        },
      ],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return finalResult.uri;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
};
