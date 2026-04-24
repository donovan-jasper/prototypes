import { DesignSystem } from '../types';

export const blendSystems = (systems: DesignSystem[], weights: number[]): DesignSystem => {
  // Normalize weights to ensure they sum to 1
  const sum = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / sum);

  const blendedSystem: DesignSystem = {
    id: Date.now().toString(),
    name: generateBlendedName(systems, normalizedWeights),
    colors: blendColors(systems.map(s => s.colors), normalizedWeights),
    typography: blendTypography(systems.map(s => s.typography), normalizedWeights),
    spacing: blendSpacing(systems.map(s => s.spacing), normalizedWeights),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return blendedSystem;
};

const generateBlendedName = (systems: DesignSystem[], weights: number[]): string => {
  // Create a name that reflects the blend proportions
  const nameParts = systems.map((system, index) => {
    const weightPercent = Math.round(weights[index] * 100);
    return `${system.name} (${weightPercent}%)`;
  });

  return `Blend: ${nameParts.join(', ')}`;
};

const blendColors = (colorSets: Record<string, string>[], weights: number[]): Record<string, string> => {
  const blendedColors: Record<string, string> = {};
  const colorNames = Object.keys(colorSets[0]);

  colorNames.forEach((name) => {
    let r = 0, g = 0, b = 0;

    colorSets.forEach((colors, index) => {
      const color = colors[name];
      const hex = color.replace('#', '');
      const rVal = parseInt(hex.substring(0, 2), 16);
      const gVal = parseInt(hex.substring(2, 4), 16);
      const bVal = parseInt(hex.substring(4, 6), 16);

      r += rVal * weights[index];
      g += gVal * weights[index];
      b += bVal * weights[index];
    });

    // Convert back to hex and ensure proper formatting
    const blendedHex = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    blendedColors[name] = blendedHex.toUpperCase();
  });

  return blendedColors;
};

const blendTypography = (typographySets: { base: number; ratio: number; scale: number[] }[], weights: number[]): { base: number; ratio: number; scale: number[] } => {
  let base = 0;
  let ratio = 0;

  typographySets.forEach((typography, index) => {
    base += typography.base * weights[index];
    ratio += typography.ratio * weights[index];
  });

  // Generate a new typography scale based on the blended values
  const scale = [];
  for (let i = 0; i < 6; i++) {
    scale.push(Math.round(base * Math.pow(ratio, i)));
  }

  return {
    base: Math.round(base),
    ratio,
    scale,
  };
};

const blendSpacing = (spacingSets: number[][], weights: number[]): number[] => {
  const blendedSpacing: number[] = [];

  // Assume all spacing sets have the same length
  for (let i = 0; i < spacingSets[0].length; i++) {
    let value = 0;
    spacingSets.forEach((spacing, index) => {
      value += spacing[i] * weights[index];
    });
    blendedSpacing.push(Math.round(value));
  }

  return blendedSpacing;
};
