import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export const scanDocument = async (uri: string): Promise<string> => {
  try {
    // Resize and optimize the image for better OCR processing
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // For now, we'll use a fallback approach since expo-image-manipulator
    // doesn't have built-in OCR. In a production app, you would:
    // 1. Use a cloud OCR service (Google Vision API, AWS Textract, etc.)
    // 2. Use react-native-text-recognition if available
    // 3. Implement native module integration
    
    // Fallback: Return empty string to trigger manual entry
    // The UI will show the image and allow manual text entry
    return '';
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};

// Helper function to check if we have a valid OCR result
export const hasValidOCR = (ocrText: string): boolean => {
  return ocrText && ocrText.trim().length > 0;
};
