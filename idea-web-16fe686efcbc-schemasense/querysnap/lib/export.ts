import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const exportToCSV = (data) => {
  const csv = data.map((row) => Object.values(row).join(',')).join('\n');
  const uri = FileSystem.documentDirectory + 'export.csv';
  FileSystem.writeAsStringAsync(uri, csv);
  Sharing.shareAsync(uri);
};

export const exportToPDF = async (data, title) => {
  // Implement PDF generation
};

export const shareResults = (data) => {
  // Implement sharing functionality
};

export const generateReport = (data, title) => {
  // Implement report generation
};
