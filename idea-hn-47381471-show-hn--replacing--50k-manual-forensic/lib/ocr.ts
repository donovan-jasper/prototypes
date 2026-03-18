import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// Google Cloud Vision API configuration
const GOOGLE_CLOUD_VISION_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;

// Cache for OCR results
const ocrCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const scanDocument = async (uri: string): Promise<string> => {
  try {
    // Check cache first
    const cached = ocrCache.get(uri);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached OCR result');
      return cached.text;
    }

    // Resize and optimize the image for better OCR processing
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Read image as base64
    const base64Image = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Call Google Cloud Vision API
    const response = await fetch(VISION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vision API error:', errorData);
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract text from response
    const textAnnotations = data.responses?.[0]?.textAnnotations;
    if (textAnnotations && textAnnotations.length > 0) {
      const extractedText = textAnnotations[0].description || '';
      
      // Cache the result
      ocrCache.set(uri, {
        text: extractedText,
        timestamp: Date.now(),
      });
      
      return extractedText;
    }

    // No text detected
    console.log('No text detected in image');
    return '';
  } catch (error) {
    console.error('Error processing document:', error);
    
    // Network error handling
    if (error instanceof TypeError && error.message.includes('Network')) {
      throw new Error('Network error: Please check your internet connection and try again.');
    }
    
    // API key error
    if (error.message?.includes('API key')) {
      throw new Error('OCR service configuration error. Please contact support.');
    }
    
    // Generic error - fall back to manual entry
    throw new Error('Failed to extract text from image. Please enter details manually.');
  }
};

// Helper function to check if we have a valid OCR result
export const hasValidOCR = (ocrText: string): boolean => {
  return ocrText && ocrText.trim().length > 0;
};

// Clear cache (useful for testing or memory management)
export const clearOCRCache = () => {
  ocrCache.clear();
};

// Get cache size
export const getOCRCacheSize = () => {
  return ocrCache.size;
};
