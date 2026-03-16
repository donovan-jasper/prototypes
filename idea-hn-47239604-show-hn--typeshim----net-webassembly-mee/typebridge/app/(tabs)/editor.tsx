import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { loadProject, saveProject } from '../../lib/storage';
import { compileTypeScriptToWasm } from '../../lib/compiler';

const EditorScreen = () => {
  const { projectId } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [project, setProject] = useState(null);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        const loadedProject = await loadProject(projectId);
        setProject(loadedProject);
        setCode(loadedProject.code);
      }
    };
    loadProjectData();
  }, [projectId]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Debounce save
  };

  const handleCompile = async () => {
    const result = await compileTypeScriptToWasm(code);
    if (result.success) {
      const updatedProject = { ...project, wasmBytes: result.wasmBytes };
      await saveProject(updatedProject);
      setProject(updatedProject);
    } else {
      // Show error
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs/loader.js' }}
        onMessage={(event) => {
          const message = JSON.parse(event.nativeEvent.data);
          if (message.type === 'codeChange') {
            handleCodeChange(message.code);
          }
        }}
        injectedJavaScript={`
          // Monaco Editor initialization code
          // Send code changes to React Native
        `}
      />
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.button} onPress={handleCompile}>
          <Text style={styles.buttonText}>Compile</Text>
        </TouchableOpacity>
        {/* Add Preview and Export buttons */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  button: {
    padding: 8,
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
  },
});

export default EditorScreen;
