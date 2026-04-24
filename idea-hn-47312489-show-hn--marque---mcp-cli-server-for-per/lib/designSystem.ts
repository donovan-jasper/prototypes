import { ImageAnalysis } from './imageAnalysis';

export interface DesignSystem {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string;
  };
  typography: {
    base: number;
    ratio: number;
    fontFamily?: string;
    weights: number[];
    scale: number[];
  };
  spacing: {
    base: number;
    ratio: number;
    scale: number[];
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
  createdAt: Date;
  updatedAt: Date;
}

export const generateSystem = (analysis: ImageAnalysis): DesignSystem => {
  const id = generateId();
  const name = generateSystemName(analysis.colors);
  const colors = generateColorPalette(analysis.colors);
  const typography = generateTypographyScale(analysis.typography);
  const spacing = generateSpacingScale(analysis.spacing);

  return {
    id,
    name,
    colors,
    typography,
    spacing,
    components: analysis.components,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateSystemName = (colors: string[]): string => {
  if (!colors || colors.length === 0) {
    return 'Grayscale System';
  }

  // Simple name generation based on dominant colors
  const colorDescriptors = ['Vibrant', 'Elegant', 'Modern', 'Classic', 'Bold', 'Ocean', 'Sunset', 'Forest', 'Midnight', 'Sunrise'];
  const randomDescriptor = colorDescriptors[Math.floor(Math.random() * colorDescriptors.length)];

  // Check if colors are light or dark
  const isLight = colors.some(color => {
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  });

  const theme = isLight ? 'Light' : 'Dark';

  return `${randomDescriptor} ${theme}`;
};

const generateColorPalette = (colors: string[]): DesignSystem['colors'] => {
  const palette: DesignSystem['colors'] = {};
  const colorNames = ['primary', 'secondary', 'accent', 'background', 'text'];

  // If no colors detected, use grayscale palette
  if (!colors || colors.length === 0) {
    return {
      primary: '#333333',
      secondary: '#666666',
      accent: '#999999',
      background: '#FFFFFF',
      text: '#000000',
    };
  }

  // Assign colors to semantic names
  colors.forEach((color, index) => {
    if (index < colorNames.length) {
      palette[colorNames[index]] = color;
    } else {
      // Add additional colors with generic names
      palette[`color${index + 1}`] = color;
    }
  });

  // Fill in missing colors with defaults
  if (!palette.primary) palette.primary = '#007AFF';
  if (!palette.secondary) palette.secondary = '#5856D6';
  if (!palette.accent) palette.accent = '#FF9500';
  if (!palette.background) palette.background = '#FFFFFF';
  if (!palette.text) palette.text = '#000000';

  return palette;
};

const generateTypographyScale = (typography: ImageAnalysis['typography']): DesignSystem['typography'] => {
  const scale = [];
  const baseSize = typography.base || 16;
  const ratio = typography.ratio || 1.25;

  for (let i = 0; i < 6; i++) {
    scale.push(Math.round(baseSize * Math.pow(ratio, i)));
  }

  return {
    base: baseSize,
    ratio,
    fontFamily: typography.fontFamily || 'System',
    weights: typography.weights || [400, 500, 700],
    scale
  };
};

const generateSpacingScale = (spacing: ImageAnalysis['spacing']): DesignSystem['spacing'] => {
  const scale = [];
  const base = spacing.base || 4;
  const ratio = spacing.ratio || 1.5;

  for (let i = 0; i < 8; i++) {
    scale.push(Math.round(base * Math.pow(ratio, i)));
  }

  return {
    base,
    ratio,
    scale
  };
};
