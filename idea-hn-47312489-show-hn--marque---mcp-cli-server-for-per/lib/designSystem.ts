export const generateSystem = (analysis: any) => {
  // Handle missing or partial data gracefully
  const colors = analysis?.colors || [];
  const typography = analysis?.typography || {};
  const spacing = analysis?.spacing || {};

  const system = {
    name: generateSystemName(colors),
    colors: generateColorPalette(colors),
    typography: generateTypographyScale(typography),
    spacing: generateSpacingScale(spacing),
  };

  return system;
};

const generateSystemName = (colors: string[]) => {
  if (!colors || colors.length === 0) {
    return 'Grayscale System';
  }

  // Simple name generation based on dominant colors
  const colorDescriptors = ['Vibrant', 'Elegant', 'Modern', 'Classic', 'Bold'];
  const randomDescriptor = colorDescriptors[Math.floor(Math.random() * colorDescriptors.length)];
  
  return `${randomDescriptor} Palette`;
};

const generateColorPalette = (colors: string[]) => {
  const palette: { [key: string]: string } = {};
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

const generateTypographyScale = (typography: any) => {
  const scale = [];
  const baseSize = typography?.base || 16;
  const ratio = typography?.ratio || 1.25;

  for (let i = 0; i < 6; i++) {
    scale.push(Math.round(baseSize * Math.pow(ratio, i)));
  }

  return {
    base: baseSize,
    ratio,
    scale,
  };
};

const generateSpacingScale = (spacing: any) => {
  const scale = [];
  const base = spacing?.base || 4;
  const ratio = spacing?.ratio || 1.5;

  for (let i = 0; i < 8; i++) {
    scale.push(Math.round(base * Math.pow(ratio, i)));
  }

  return scale;
};
