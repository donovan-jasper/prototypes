import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { compileTypeScriptToWasm } from '../../lib/compiler';
import { updateProject, getProjectById } from '../../lib/database';

export default function EditorScreen({ route }) {
  const { projectId } = route.params;
  const [code, setCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState(null);
  const webViewRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      const project = await getProjectById(projectId);
      if (project) {
        setCode(project.code || '');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      Alert.alert('Error', 'Failed to load project');
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Auto-save every 3 seconds
    const timeout = setTimeout(() => saveProject(newCode), 3000);
    return () => clearTimeout(timeout);
  };

  const saveProject = async (codeToSave) => {
    try {
      await updateProject({ id: projectId, code: codeToSave });
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const compileCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter some code to compile');
      return;
    }

    setIsCompiling(true);
    setCompilationError(null);

    try {
      const result = await compileTypeScriptToWasm(code);

      if (result.success) {
        await updateProject({
          id: projectId,
          code,
          wasmBytes: result.wasmBytes
        });
        navigation.navigate('preview', { projectId });
      } else {
        setCompilationError(result.error || 'Compilation failed');
      }
    } catch (error) {
      console.error('Compilation error:', error);
      setCompilationError(error.message || 'Unknown compilation error');
    } finally {
      setIsCompiling(false);
    }
  };

  const editorHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js"></script>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          #container { height: 100%; }
        </style>
      </head>
      <body>
        <div id="container"></div>
        <script>
          require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' }});
          require(['vs/editor/editor.main'], function() {
            const editor = monaco.editor.create(document.getElementById('container'), {
              value: ${JSON.stringify(code)},
              language: 'typescript',
              theme: 'vs-dark',
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              wordWrap: 'on'
            });

            editor.onDidChangeModelContent(() => {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: 'codeChange',
                  code: editor.getValue()
                })
              );
            });

            window.addEventListener('message', (event) => {
              if (event.data.type === 'setCode') {
                editor.setValue(event.data.code);
              }
            });
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: editorHtml }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'codeChange') {
              handleCodeChange(data.code);
            }
          } catch (error) {
            console.error('Error parsing WebView message:', error);
          }
        }}
        javaScriptEnabled={true}
        style={styles.editor}
        originWhitelist={['*']}
      />

      {compilationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{compilationError}</Text>
        </View>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.button, styles.compileButton]}
          onPress={compileCode}
          disabled={isCompiling}
        >
          {isCompiling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Compile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.previewButton]}
          onPress={() => navigation.navigate('preview', { projectId })}
          disabled={isCompiling}
        >
          <Text style={styles.buttonText}>Preview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  editor: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compileButton: {
    backgroundColor: '#007acc',
    flex: 1,
  },
  previewButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ff5555',
    padding: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
  },
});
