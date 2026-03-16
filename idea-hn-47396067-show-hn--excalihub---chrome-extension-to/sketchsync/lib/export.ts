import { CanvasElement } from './drawing';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const exportToPNG = async (elements: CanvasElement[]): Promise<{ uri: string }> => {
  // Implement PNG export logic
  // This is a placeholder implementation
  console.log('Exporting to PNG');
  const fileUri = `${FileSystem.documentDirectory}drawing.png`;
  await FileSystem.writeAsStringAsync(fileUri, 'PNG data');
  return { uri: fileUri };
};

export const exportToSVG = async (elements: CanvasElement[]): Promise<{ uri: string }> => {
  // Implement SVG export logic
  // This is a placeholder implementation
  console.log('Exporting to SVG');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    ${elements.map(element => `<path d="${element.path}" stroke="${element.color}" stroke-width="${element.strokeWidth}" fill="none" />`).join('\n')}
  </svg>`;
  const fileUri = `${FileSystem.documentDirectory}drawing.svg`;
  await FileSystem.writeAsStringAsync(fileUri, svgContent);
  return { uri: fileUri };
};

export const shareFile = async (uri: string): Promise<void> => {
  await Sharing.shareAsync(uri);
};
