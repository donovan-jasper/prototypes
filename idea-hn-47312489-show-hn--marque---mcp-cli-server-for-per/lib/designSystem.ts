export const generateSystem = (analysis) => {
  const system = {
    name: generateSystemName(analysis),
    colors: generateColorPalette(analysis.colors),
    typography: generateTypographyScale(analysis.typography),
    spacing: generateSpacingScale(analysis.spacing),
  };

  return system;
};

const generateSystemName = (analysis) => {
  // Simple name generation based on dominant colors
  const colorNames = Object.keys(analysis.colors);
  return `${colorNames[0]} ${colorNames[1]}`;
};

const generateColorPalette = (colors) => {
  const palette = {};
  const colorNames = ['primary', 'secondary', 'accent', 'background', 'text'];

  colors.forEach((color, index) => {
    palette[colorNames[index]] = color;
  });

  return palette;
};

const generateTypographyScale = (typography) => {
  const scale = [];
  const baseSize = typography.base || 16;
  const ratio = typography.ratio || 1.25;

  for (let i = 0; i < 6; i++) {
    scale.push(Math.round(baseSize * Math.pow(ratio, i)));
  }

  return {
    base: baseSize,
    ratio,
    scale,
  };
};

const generateSpacingScale = (spacing) => {
  const scale = [];
  const base = spacing.base || 4;
  const ratio = spacing.ratio || 1.5;

  for (let i = 0; i < 8; i++) {
    scale.push(Math.round(base * Math.pow(ratio, i)));
  }

  return scale;
};
