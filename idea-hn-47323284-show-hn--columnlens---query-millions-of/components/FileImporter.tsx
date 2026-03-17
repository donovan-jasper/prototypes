import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { parseCSV, detectColumnTypes } from '../lib/csv-parser';
import { createTable, insertRows } from '../lib/database';
import { useFilesStore } from '../store/files';

const FileImporter = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addFile } = useFilesStore();

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setProgress(0);

      // Pick CSV file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.type !== 'success') {
        setIsImporting(false);
        return;
      }

      // Read file content
      const fileContent = await fetch(result.uri).then(res => res.text());

      // Parse CSV with progress tracking
      const { columns, rows } = await parseCSV(fileContent, (progress) => {
        setProgress(Math.round(progress * 100));
      });

      // Detect column types
      const types = detectColumnTypes(rows);

      // Create table name based on file name
      const tableName = `file_${Date.now()}`;

      // Create table and insert rows
      await createTable(tableName, types);
      await insertRows(tableName, rows);

      // Store file metadata
      const fileMetadata = {
        id: tableName,
        name: result.name,
        size: result.size,
        rowCount: rows.length,
        importedAt: new Date().toISOString(),
      };

      addFile(fileMetadata);

      // Notify parent component
      if (onImportComplete) {
        onImportComplete(fileMetadata);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import file. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Import CSV"
        onPress={handleImport}
        disabled={isImporting}
      />

      {isImporting && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.progressText}>Importing: {progress}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default FileImporter;
