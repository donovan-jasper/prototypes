import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { loadProject } from '../../lib/storage';
import WasmPreview from '../../components/WasmPreview';

const PreviewScreen = () => {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!projectId) {
          setError('No project ID provided');
          return;
        }

        const loadedProject = await loadProject(projectId);
        if (!loadedProject) {
          setError('Project not found');
          return;
        }

        setProject(loadedProject);
      } catch (err) {
        setError(err.message || 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007acc" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!project?.wasmBytes) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No compiled WASM found. Please compile your project first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{project.name}</Text>
      <WasmPreview
        wasmBytes={new Uint8Array(project.wasmBytes)}
        onConsoleOutput={(output) => {
          // You could add additional handling here
        }}
      />
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

export default PreviewScreen;
