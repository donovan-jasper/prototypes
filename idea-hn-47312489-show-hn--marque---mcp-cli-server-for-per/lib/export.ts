export const exportToReactNative = (system) => {
  let code = `import { StyleSheet } from 'react-native';\n\n`;
  code += `const styles = StyleSheet.create({\n`;
  code += `  colors: {\n`;
  Object.entries(system.colors).forEach(([name, color]) => {
    code += `    ${name}: '${color}',\n`;
  });
  code += `  },\n`;
  code += `  typography: {\n`;
  system.typography.scale.forEach((size, index) => {
    code += `    h${index + 1}: {\n`;
    code += `      fontSize: ${size},\n`;
    code += `      fontWeight: '${index === 0 ? 'bold' : 'normal'}',\n`;
    code += `    },\n`;
  });
  code += `  },\n`;
  code += `  spacing: {\n`;
  system.spacing.forEach((value, index) => {
    code += `    s${index + 1}: ${value},\n`;
  });
  code += `  },\n`;
  code += `});\n\n`;
  code += `export default styles;`;

  return code;
};

export const exportToTailwind = (system) => {
  let config = `/** @type {import('tailwindcss').Config} */\n`;
  config += `module.exports = {\n`;
  config += `  theme: {\n`;
  config += `    extend: {\n`;
  config += `      colors: {\n`;
  Object.entries(system.colors).forEach(([name, color]) => {
    config += `        ${name}: '${color}',\n`;
  });
  config += `      },\n`;
  config += `      fontSize: {\n`;
  system.typography.scale.forEach((size, index) => {
    config += `        ${index + 1}xl: ['${size}px', {\n`;
    config += `          lineHeight: '${Math.round(size * 1.5)}px',\n`;
    config += `          fontWeight: '${index === 0 ? '700' : '400'}',\n`;
    config += `        }],\n`;
  });
  config += `      },\n`;
  config += `      spacing: {\n`;
  system.spacing.forEach((value, index) => {
    config += `        ${index + 1}: '${value}px',\n`;
  });
  config += `      },\n`;
  config += `    },\n`;
  config += `  },\n`;
  config += `  plugins: [],\n`;
  config += `};`;

  return config;
};

export const exportToCSS = (system) => {
  let css = `:root {\n`;
  Object.entries(system.colors).forEach(([name, color]) => {
    css += `  --color-${name}: ${color};\n`;
  });
  system.typography.scale.forEach((size, index) => {
    css += `  --font-size-${index + 1}: ${size}px;\n`;
    css += `  --line-height-${index + 1}: ${Math.round(size * 1.5)}px;\n`;
    css += `  --font-weight-${index + 1}: ${index === 0 ? '700' : '400'};\n`;
  });
  system.spacing.forEach((value, index) => {
    css += `  --spacing-${index + 1}: ${value}px;\n`;
  });
  css += `}\n\n`;
  css += `/* Example usage */\n`;
  css += `.heading-1 {\n`;
  css += `  font-size: var(--font-size-1);\n`;
  css += `  line-height: var(--line-height-1);\n`;
  css += `  font-weight: var(--font-weight-1);\n`;
  css += `}\n\n`;
  css += `.button {\n`;
  css += `  background-color: var(--color-primary);\n`;
  css += `  color: var(--color-text);\n`;
  css += `  padding: var(--spacing-2) var(--spacing-3);\n`;
  css += `  border-radius: var(--spacing-1);\n`;
  css += `}`;

  return css;
};

export const exportToFigma = (system) => {
  const figmaTokens = {
    color: {},
    typography: {},
    spacing: {},
  };

  Object.entries(system.colors).forEach(([name, color]) => {
    figmaTokens.color[name] = {
      value: color,
      type: 'color',
    };
  });

  system.typography.scale.forEach((size, index) => {
    figmaTokens.typography[`heading-${index + 1}`] = {
      value: {
        fontSize: size,
        textDecoration: 'none',
        fontFamily: 'Inter',
        fontWeight: index === 0 ? 700 : 400,
        fontStyle: 'normal',
        letterSpacing: 0,
        lineHeight: Math.round(size * 1.5),
        paragraphIndent: 0,
        paragraphSpacing: 0,
        textCase: 'none',
      },
      type: 'typography',
    };
  });

  system.spacing.forEach((value, index) => {
    figmaTokens.spacing[`spacing-${index + 1}`] = {
      value: value,
      type: 'sizing',
    };
  });

  return JSON.stringify(figmaTokens, null, 2);
};
