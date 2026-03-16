import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { parseCSV } from '../lib/csv-parser';
import { createTable, insertRows } from '../lib/database';
import { useFileStore } from '../store/files';

const FileImporter = () => {
  const [progress, setProgress] = useState(0);
  const { addFile } = useFileStore();

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/csv',
    });

    if (result.type === 'success') {
      const file = result;
      const csv = await fetch(file.uri).then((res) => res.text());
      const { columns, rows, types } = await parseCSV(csv, (progress) => setProgress(progress));

      const tableName = `file_${Date.now()}`;
      await createTable(tableName, types);
      await insertRows(tableName, rows);

      addFile({
        id: tableName,
        name: file.name,
        size: file.size,
        rowCount: rows.length,
        importedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Import CSV" onPress={handleImport} />
      <Text>Progress: {progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default FileImporter;
