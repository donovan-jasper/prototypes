import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { analyzeImage } from './ai';

export interface ImageAnalysis {
  colors: string[];
  typography: {
    base: number;
    ratio: number;
    fontFamily?: string;
    weights?: number[];
  };
  spacing: {
    base: number;
    ratio: number;
  };
  components?: {
    buttons?: {
      primary: {
        background: string;
        text: string;
      };
      secondary: {
        background: string;
        text: string;
      };
    };
    cards?: {
      background: string;
      borderRadius: number;
      shadow: string;
    };
  };
}

export const analyzeImageFromUri = async (imageUri: string): Promise<ImageAnalysis> => {
  try {
    const base64Data = await convertImageToBase64(imageUri);
    const analysis = await analyzeImage(imageUri);
    return normalizeAnalysis(analysis);
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const extractColors = async (imageUri: string): Promise<string[]> => {
  try {
    const analysis = await analyzeImageFromUri(imageUri);
    return analysis.colors || [];
  } catch (error) {
    console.error('Error extracting colors:', error);
    throw new Error('Failed to extract colors from image');
  }
};

export const analyzeTypography = async (imageUri: string): Promise<ImageAnalysis['typography']> => {
  try {
    const analysis = await analyzeImageFromUri(imageUri);
    return analysis.typography || { base: 16, ratio: 1.25 };
  } catch (error) {
    console.error('Error analyzing typography:', error);
    throw new Error('Failed to analyze typography from image');
  }
};

export const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    // Resize image to reduce API costs (max 1024px width)
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Read the resized image as base64
    const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    if (error.message?.includes('not found')) {
      throw new Error('Image file not found. Please try capturing again.');
    }
    throw new Error('Failed to process image. Please try again.');
  }
};

const normalizeAnalysis = (rawAnalysis: any): ImageAnalysis => {
  // Ensure we have all required fields with defaults
  return {
    colors: rawAnalysis.colors || [],
    typography: {
      base: rawAnalysis.typography?.base || 16,
      ratio: rawAnalysis.typography?.ratio || 1.25,
      fontFamily: rawAnalysis.typography?.fontFamily,
      weights: rawAnalysis.typography?.weights || [400, 500, 700]
    },
    spacing: {
      base: rawAnalysis.spacing?.base || 4,
      ratio: rawAnalysis.spacing?.ratio || 1.5
    },
    components: rawAnalysis.components || {}
  };
};
