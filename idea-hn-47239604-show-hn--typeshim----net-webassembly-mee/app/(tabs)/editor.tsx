import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CodeEditor from '../../components/CodeEditor';
import WasmPreview from '../../components/WasmPreview';
import ConsoleOutput from '../../components/ConsoleOutput';
import { loadProject, saveProject } from '../../lib/storage';

const EditorScreen = () => {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [code, setCode] = useState('');
  const [wasmBytes, setWasmBytes] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId).then(loadedProject => {
        if (loadedProject) {
          setProject(loadedProject);
          setCode(loadedProject.code || '');
          if (loadedProject.wasmBytes) {
            setWasmBytes(new Uint8Array(loadedProject.wasmBytes));
          }
        }
      });
    }
  }, [projectId]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Auto-save with debounce
    const debounceTimer = setTimeout(() => {
      if (project) {
        saveProject({ ...project, code: newCode });
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  };

  const handleCompile = async (result) => {
    setIsCompiling(false);

    if (result.success) {
      setWasmBytes(result.wasmBytes);
      if (project) {
        await saveProject({
          ...project,
          wasmBytes: Array.from(result.wasmBytes),
          updatedAt: Date.now()
        });
      }
      Alert.alert('Success', 'Compilation completed successfully');
    } else {
      Alert.alert('Error', result.error || 'Compilation failed');
    }
  };

  const handleConsoleOutput = (output) => {
    setConsoleLogs(prev => [...prev, output]);
  };

  const handleClearConsole = () => {
    setConsoleLogs([]);
  };

  const handlePreview = () => {
    if (!wasmBytes) {
      Alert.alert('Error', 'No compiled WASM available. Please compile first.');
      return;
    }
    // Navigate to preview screen with WASM bytes
    router.push({
      pathname: '/preview',
      params: { projectId }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.editorContainer}>
        <CodeEditor
          initialCode={code}
          onCodeChange={handleCodeChange}
          onCompile={handleCompile}
          onProgress={setCompilationProgress}
        />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.button, isCompiling && styles.disabledButton]}
          onPress={() => setIsCompiling(true)}
          disabled={isCompiling}
        >
          <Text style={styles.buttonText}>
            {isCompiling ? `Compiling (${compilationProgress}%)...` : 'Compile'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !wasmBytes && styles.disabledButton]}
          onPress={handlePreview}
          disabled={!wasmBytes}
        >
          <Text style={styles.buttonText}>Preview</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.consoleContainer}>
        <ConsoleOutput logs={consoleLogs} onClear={handleClearConsole} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editorContainer: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  disabledButton: {
    backgroundColor: '#cccccc',
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

export default EditorScreen;
