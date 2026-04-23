export type Point = {
  x: number;
  y: number;
};

export type CanvasElement = {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'line' | 'text';
  color: string;
  strokeWidth: number;
  path?: any; // Skia Path object
  points?: Point[];
  // Add other properties for different element types
};
