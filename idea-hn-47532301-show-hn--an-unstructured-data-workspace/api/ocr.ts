import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { createWorker } from 'tesseract.js';

export const processImageWithOCR = async (imageUri: string): Promise<string> => {
  try {
    // Preprocess the image for better OCR results
    const processedImage = await preprocessImage(imageUri);

    // Initialize Tesseract worker
    const worker = await createWorker('eng');

    // Perform OCR
    const { data: { text } } = await worker.recognize(processedImage.uri);
    await worker.terminate();

    // Clean up temporary files
    await FileSystem.deleteAsync(processedImage.uri, { idempotent: true });

    return text;
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw error;
  }
};

async function preprocessImage(imageUri: string) {
  // Convert to grayscale and resize for better OCR
  const manipResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1000 } }, { grayscale: true }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Create a temporary file for Tesseract
  const tempUri = FileSystem.documentDirectory + 'temp_ocr.jpg';
  await FileSystem.copyAsync({
    from: manipResult.uri,
    to: tempUri
  });

  return { uri: tempUri };
}
