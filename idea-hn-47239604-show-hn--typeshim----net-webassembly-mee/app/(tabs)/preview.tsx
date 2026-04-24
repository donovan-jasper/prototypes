import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import WasmPreview from '../../components/WasmPreview';
import ConsoleOutput from '../../components/ConsoleOutput';
import { loadProject } from '../../lib/storage';

const PreviewScreen = () => {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [wasmBytes, setWasmBytes] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId).then(loadedProject => {
        if (loadedProject && loadedProject.wasmBytes) {
          setProject(loadedProject);
          setWasmBytes(new Uint8Array(loadedProject.wasmBytes));
        } else {
          Alert.alert('Error', 'No compiled WASM found for this project');
        }
        setIsLoading(false);
      });
    }
  }, [projectId]);

  const handleConsoleOutput = (output) => {
    setConsoleLogs(prev => [...prev, output]);
  };

  const handleError = (error) => {
    setConsoleLogs(prev => [...prev, `ERROR: ${error}`]);
  };

  const handleRefresh = () => {
    if (project && project.wasmBytes) {
      setWasmBytes(new Uint8Array(project.wasmBytes));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading project...</Text>
      </View>
    );
  }

  if (!wasmBytes) {
    return (
      <View style={styles.errorContainer}>
        <Text>No compiled WASM available. Please compile your project first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <WasmPreview
          wasmBytes={wasmBytes}
          onConsoleOutput={handleConsoleOutput}
          onError={handleError}
        />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.button} onPress={handleRefresh}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.consoleContainer}>
        <ConsoleOutput logs={consoleLogs} onClear={() => setConsoleLogs([])} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  consoleContainer: {
    height: 200,
    padding: 10,
  },
});

export default PreviewScreen;
