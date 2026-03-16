export const blendSystems = (systems, weights) => {
  const blendedSystem = {
    name: generateBlendedName(systems, weights),
    colors: blendColors(systems.map(s => s.colors), weights),
    typography: blendTypography(systems.map(s => s.typography), weights),
    spacing: blendSpacing(systems.map(s => s.spacing), weights),
  };

  return blendedSystem;
};

const generateBlendedName = (systems, weights) => {
  // Simple name generation based on weighted system names
  let name = '';
  systems.forEach((system, index) => {
    name += `${system.name} (${Math.round(weights[index] * 100)}%) `;
  });
  return name.trim();
};

const blendColors = (colorSets, weights) => {
  const blendedColors = {};
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

    const blendedHex = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    blendedColors[name] = blendedHex;
  });

  return blendedColors;
};

const blendTypography = (typographySets, weights) => {
  let base = 0;
  let ratio = 0;

  typographySets.forEach((typography, index) => {
    base += typography.base * weights[index];
    ratio += typography.ratio * weights[index];
  });

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

const blendSpacing = (spacingSets, weights) => {
  const blendedSpacing = [];

  for (let i = 0; i < spacingSets[0].length; i++) {
    let value = 0;
    spacingSets.forEach((spacing, index) => {
      value += spacing[i] * weights[index];
    });
    blendedSpacing.push(Math.round(value));
  }

  return blendedSpacing;
};
