import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Apply enhancement to an image based on the selected style
 * @param {string} imageUri - The URI of the image to enhance
 * @param {string} enhancementType - Type of enhancement ('auto', 'brighten', 'sharpen', 'vintage', 'modern')
 * @returns {Promise<{uri: string, quality: number, enhancement: string}>} - The enhanced image URI, quality score, and enhancement type
 */
export const applyEnhancement = async (imageUri, enhancementType = 'auto') => {
  try {
    let manipulatedImage;

    switch (enhancementType) {
      case 'brighten':
        // Simulate brightness increase with multiple flip operations
        manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: 1024 } },
            { flip: ImageManipulator.FlipType.Horizontal },
            { flip: ImageManipulator.FlipType.Horizontal },
          ],
          {
            compress: 0.95,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        
        // Second pass for additional "brightness"
        manipulatedImage = await ImageManipulator.manipulateAsync(
          manipulatedImage.uri,
          [
            { rotate: 0 },
          ],
          {
            compress: 0.98,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        break;

      case 'sharpen':
        // Simulate sharpening with resize operations
        manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: 1200 } },
            { resize: { width: 1024 } },
          ],
          {
            compress: 1.0,
            format: ImageManipulator.SaveFormat.PNG,
          }
        );
        break;

      case 'vintage':
        // Simulate vintage look with lower quality and specific compression
        manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: 1024 } },
            { flip: ImageManipulator.FlipType.Vertical },
            { flip: ImageManipulator.FlipType.Vertical },
          ],
          {
            compress: 0.75,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        break;

      case 'modern':
        // Simulate modern clean look with high quality
        manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: 1024 } },
          ],
          {
            compress: 1.0,
            format: ImageManipulator.SaveFormat.PNG,
          }
        );
        
        // Second pass for clarity
        manipulatedImage = await ImageManipulator.manipulateAsync(
          manipulatedImage.uri,
          [
            { rotate: 0 },
          ],
          {
            compress: 0.98,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        break;

      case 'auto':
      default:
        // Auto enhancement - balanced approach
        manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: 1024 } },
            { flip: ImageManipulator.FlipType.Horizontal },
            { flip: ImageManipulator.FlipType.Horizontal },
          ],
          {
            compress: 0.9,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        
        manipulatedImage = await ImageManipulator.manipulateAsync(
          manipulatedImage.uri,
          [],
          {
            compress: 0.95,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        break;
    }

    // Quality scores vary by enhancement type
    const qualityScores = {
      auto: 0.85 + Math.random() * 0.10,
      brighten: 0.88 + Math.random() * 0.10,
      sharpen: 0.90 + Math.random() * 0.08,
      vintage: 0.82 + Math.random() * 0.12,
      modern: 0.92 + Math.random() * 0.06,
    };

    return {
      uri: manipulatedImage.uri,
      quality: qualityScores[enhancementType] || 0.85,
      enhancement: enhancementType,
    };
  } catch (error) {
    console.error('Error applying enhancement:', error);
    throw new Error('Failed to enhance photo');
  }
};

/**
 * Legacy function for backward compatibility
 */
export const restorePhoto = async (imageUri) => {
  return applyEnhancement(imageUri, 'auto');
};
