import { useCameraDevice, useCameraFormat, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { scanBarcodes, BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';
import { useOCR, TextBlock } from 'vision-camera-ocr';
import * as FileSystem from 'expo-file-system';
import { useState, useCallback } from 'react';

// Cache for OCR results
const ocrCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useOnDeviceOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
    { fps: 30 },
  ]);

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS], {
    checkInverted: true,
  });

  const onTextRecognized = useCallback((textBlocks: TextBlock[]) => {
    const extractedText = textBlocks.map(block => block.text).join('\n');
    runOnJS(setOcrResult)(extractedText);
    runOnJS(setIsProcessing)(false);
  }, []);

  const onTextError = useCallback((error: any) => {
    runOnJS(setError)(error.message);
    runOnJS(setIsProcessing)(false);
  }, []);

  const { scanOCRInFrame } = useOCR({
    onTextRecognized,
    onError: onTextError,
  });

  const processImage = async (uri: string): Promise<string> => {
    try {
      setIsProcessing(true);
      setError(null);

      // Check cache first
      const cached = ocrCache.get(uri);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached OCR result');
        setIsProcessing(false);
        return cached.text;
      }

      // Read image file
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Process with OCR
      const result = await scanOCRInFrame({
        image: {
          uri: uri,
          width: 1280,
          height: 720,
          orientation: 0,
          mirrored: false,
        },
      });

      // Cache the result
      ocrCache.set(uri, {
        text: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (err) {
      console.error('OCR processing error:', err);
      setError('Failed to process image with on-device OCR');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    device,
    format,
    frameProcessor,
    isProcessing,
    ocrResult,
    error,
    processImage,
    clearOCRCache: () => ocrCache.clear(),
    getOCRCacheSize: () => ocrCache.size,
  };
};

export const scanDocument = async (uri: string): Promise<string> => {
  try {
    // Check if we have a cached result
    const cached = ocrCache.get(uri);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached OCR result');
      return cached.text;
    }

    // Read image file
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Process with OCR
    const result = await scanOCRInFrame({
      image: {
        uri: uri,
        width: 1280,
        height: 720,
        orientation: 0,
        mirrored: false,
      },
    });

    // Cache the result
    ocrCache.set(uri, {
      text: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (err) {
    console.error('OCR processing error:', err);
    throw new Error('Failed to process image with on-device OCR');
  }
};

export const hasValidOCR = (ocrText: string): boolean => {
  return ocrText && ocrText.trim().length > 0;
};
