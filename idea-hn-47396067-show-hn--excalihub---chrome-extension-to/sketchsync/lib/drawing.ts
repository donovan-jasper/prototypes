import { Skia } from '@shopify/react-native-skia';

export interface CanvasElement {
  type: string;
  path?: string;
  color?: string;
  strokeWidth?: number;
  // Rectangle properties
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Circle properties
  centerX?: number;
  centerY?: number;
  radius?: number;
  // Line properties
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export const serializeCanvas = (elements: CanvasElement[]): string => {
  return JSON.stringify(elements);
};

export const deserializeCanvas = (data: string): CanvasElement[] => {
  return JSON.parse(data);
};

export const generateThumbnail = async (elements: CanvasElement[]): Promise<string> => {
  // Implement thumbnail generation logic
  // This is a placeholder implementation
  return 'data:image/png;base64,...';
};
