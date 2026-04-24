import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import ChapterEditor from '@/components/ChapterEditor';
import { useRouter } from 'expo-router';

const ImportScreen = () => {
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [fileDuration, setFileDuration] = useState<number>(0);
  const router = useRouter();

  const pickFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
      }
    } catch (err) {
      console.error('Error picking files:', err);
      setError('Failed to select files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileDuration = async (fileUri: string): Promise<number> => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: false }
      );

      const status = await sound.getStatusAsync();
      await sound.unloadAsync();

      return status.durationMillis || 0;
    } catch (err) {
      console.error('Error getting file duration:', err);
      return 0;
    }
  };

  const handleFileSelect = async (file: DocumentPicker.DocumentPickerResult) => {
    try {
      setIsLoading(true);
      setError(null);

      const duration = await getFileDuration(file.uri);
      if (duration <= 0) {
        setError('Could not determine audio duration. Please select another file.');
        return;
      }

      setSelectedFile(file);
      setFileDuration(duration);
    } catch (err) {
      console.error('Error handling file selection:', err);
      setError('Failed to process the selected file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (selectedFile) {
    return (
      <ChapterEditor
        filePath={selectedFile.uri}
        fileName={selectedFile.name || 'Unknown'}
        duration={fileDuration}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Audio Files</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <>
          <TouchableOpacity style={styles.importButton} onPress={pickFiles}>
            <Text style={styles.importButtonText}>Select Audio Files</Text>
          </TouchableOpacity>

          {selectedFiles.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Selected Files ({selectedFiles.length})</Text>
              <FlatList
                data={selectedFiles}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.fileItem}
                    onPress={() => handleFileSelect(item)}
                  >
                    <Text style={styles.fileName}>{item.name}</Text>
                    {item.size && (
                      <Text style={styles.fileSize}>
                        {(item.size / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  importButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  fileItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  loadingIndicator: {
    marginTop: 24,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ImportScreen;
