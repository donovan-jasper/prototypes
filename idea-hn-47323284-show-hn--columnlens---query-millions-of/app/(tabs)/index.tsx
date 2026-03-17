import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFilesStore } from '../../store/files';
import FileImporter from '../../components/FileImporter';
import { dropTable } from '../../lib/database';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { files, removeFile } = useFilesStore();

  const handleFilePress = (id: string) => {
    navigation.navigate('Query', { id });
  };

  const handleDeleteFile = async (id: string) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Delete File',
        'Are you sure you want to delete this file and all its data?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Delete table from database
              await dropTable(id);

              // Remove from Zustand store
              removeFile(id);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to delete file:', error);
      Alert.alert('Error', 'Failed to delete file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <View style={styles.container}>
      <FileImporter onImportComplete={() => {}} />

      <Text style={styles.sectionTitle}>Imported Files</Text>

      {files.length === 0 ? (
        <Text style={styles.emptyText}>No files imported yet. Tap "Import CSV" to get started.</Text>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fileItem}
              onPress={() => handleFilePress(item.id)}
              onLongPress={() => handleDeleteFile(item.id)}
            >
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{item.name}</Text>
                <Text style={styles.fileDetails}>
                  {formatFileSize(item.size)} • {item.rowCount.toLocaleString()} rows
                </Text>
                <Text style={styles.fileDate}>
                  Imported: {new Date(item.importedAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteFile(item.id)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  fileItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
