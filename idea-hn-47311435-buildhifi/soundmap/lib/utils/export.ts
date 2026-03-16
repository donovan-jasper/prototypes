import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export const exportShoppingList = async (components) => {
  const shoppingList = components.map(component => `${component.name} - ${component.brand}`).join('\n');
  const fileUri = FileSystem.documentDirectory + 'shopping-list.txt';
  await FileSystem.writeAsStringAsync(fileUri, shoppingList);
  await shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Share shopping list' });
};

export const exportWiringDiagram = async (components) => {
  // In a real app, you would generate an image here
  // For this prototype, we'll simulate a successful export
  const diagram = 'Wiring diagram for your system';
  const fileUri = FileSystem.documentDirectory + 'wiring-diagram.txt';
  await FileSystem.writeAsStringAsync(fileUri, diagram);
  await shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Share wiring diagram' });
};
