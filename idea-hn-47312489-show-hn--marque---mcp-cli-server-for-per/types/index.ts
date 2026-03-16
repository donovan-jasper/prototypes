export interface DesignSystem {
  id: number;
  name: string;
  colors: {
    [key: string]: string;
  };
  typography: {
    base: number;
    ratio: number;
    scale: number[];
  };
  spacing: number[];
  created_at: string;
  updated_at: string;
}

export interface ImageAnalysis {
  colors: string[];
  typography: {
    base: number;
    ratio: number;
  };
  spacing: {
    base: number;
    ratio: number;
  };
}
