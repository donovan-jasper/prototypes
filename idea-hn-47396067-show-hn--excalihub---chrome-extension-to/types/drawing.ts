export type CanvasElement = {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'text';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  color?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
};
