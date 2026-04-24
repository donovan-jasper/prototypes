import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { compileTypeScriptToWasm, getCompilationProgress, cancelCompilation } from '../../lib/compiler';
import { saveProject } from '../../lib/storage';
import { useLocalSearchParams } from 'expo-router';

const CodeEditor = () => {
  const { projectId } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationRequestId, setCompilationRequestId] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // Load project code
    const loadProject = async () => {
      if (projectId) {
        const project = await loadProject(projectId);
        if (project) {
          setCode(project.code);
        }
      }
    };
    loadProject();
  }, [projectId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Auto-save with debounce
    const debounceTimer = setTimeout(() => {
      saveProject({ id: projectId, code: newCode });
    }, 1000);

    return () => clearTimeout(debounceTimer);
  };

  const handleCompile = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter some code to compile');
      return;
    }

    setIsCompiling(true);
    setCompilationProgress(0);

    try {
      const result = await compileTypeScriptToWasm(code);
      setCompilationRequestId(result.requestId);

      // Start progress tracking
      const progressInterval = setInterval(() => {
        const progress = getCompilationProgress(result.requestId);
        setCompilationProgress(progress);

        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 200);

      if (result.success) {
        // Save compiled WASM to project
        await saveProject({
          id: projectId,
          wasmBytes: result.wasmBytes
        });
        Alert.alert('Success', 'Compilation completed successfully');
      } else {
        Alert.alert('Compilation Error', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to compile code');
    } finally {
      setIsCompiling(false);
      setCompilationRequestId(null);
    }
  };

  const handleCancel = () => {
    if (compilationRequestId) {
      cancelCompilation(compilationRequestId);
      setIsCompiling(false);
      setCompilationProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js"></script>
                <style>
                  body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
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
                      automaticLayout: true
                    });

                    editor.onDidChangeModelContent(() => {
                      const value = editor.getValue();
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'codeChange',
                        code: value
                      }));
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
          `
        }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'codeChange') {
            handleCodeChange(data.code);
          }
        }}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        style={styles.editor}
      />

      <View style={styles.toolbar}>
        {isCompiling ? (
          <>
            <Text style={styles.progressText}>Compiling: {compilationProgress}%</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.compileButton}
            onPress={handleCompile}
          >
            <Text style={styles.compileButtonText}>Compile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#373737',
  },
  compileButton: {
    backgroundColor: '#007acc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  compileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#d13639',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressText: {
    color: 'white',
    marginRight: 10,
  },
});

export default CodeEditor;
