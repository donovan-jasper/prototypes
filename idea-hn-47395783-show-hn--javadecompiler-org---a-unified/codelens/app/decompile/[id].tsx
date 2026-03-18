import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDecompilation } from '../../hooks/useDecompilation';
import CodeViewer from '../../components/CodeViewer';
import FileTree from '../../components/FileTree';

const DecompileScreen = () => {
  const { id } = useLocalSearchParams();
  const { getDecompilation } = useDecompilation();
  const [decompilation, setDecompilation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    const fetchDecompilation = async () => {
      try {
        const data = await getDecompilation(Number(id));
        setDecompilation(data);
        if (data?.files && data.files.length > 0) {
          setSelectedFile(data.files[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load decompilation:', error);
        setLoading(false);
      }
    };
    fetchDecompilation();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading decompilation...</Text>
      </View>
    );
  }

  if (!decompilation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load decompilation</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{decompilation.fileName}</Text>
        <Text style={styles.subtitle}>
          {(decompilation.fileSize / 1024).toFixed(2)} KB • {decompilation.files?.length || 0} files
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.fileTreeContainer}>
          <FileTree 
            files={decompilation.files || []} 
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
        </View>
        <View style={styles.codeViewerContainer}>
          {selectedFile ? (
            <CodeViewer code={selectedFile.content} language="java" />
          ) : (
            <View style={styles.emptyCodeViewer}>
              <Text style={styles.emptyText}>Select a file to view its contents</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  fileTreeContainer: {
    width: 250,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  codeViewerContainer: {
    flex: 1,
  },
  emptyCodeViewer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DecompileScreen;
