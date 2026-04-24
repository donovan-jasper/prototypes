import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebViewCompiler from '../../lib/compiler';
import Storage from '../../lib/storage';

const CodeEditor = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationError, setCompilationError] = useState(null);
  const webViewRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const loadProject = async () => {
      if (id) {
        const loadedProject = await Storage.loadProject(id);
        setProject(loadedProject);
      }
      setIsLoading(false);
    };

    loadProject();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [id]);

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'editorReady') {
        if (project?.code) {
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'setCode',
            code: project.code
          }));
        }
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  const handleCompile = async () => {
    if (!project?.code) return;

    setIsCompiling(true);
    setCompilationProgress(0);
    setCompilationError(null);

    // Start progress tracking
    progressIntervalRef.current = setInterval(() => {
      const progress = WebViewCompiler.getCompilationProgress(project.id);
      setCompilationProgress(progress);
    }, 200);

    try {
      const result = await WebViewCompiler.compileTypeScriptToWasm(project.code);

      if (result.success && result.wasmBytes) {
        // Validate WASM output
        if (WebViewCompiler.validateWasmOutput(result.wasmBytes)) {
          // Save compiled WASM to project
          const updatedProject = {
            ...project,
            wasmBytes: result.wasmBytes
          };
          await Storage.saveProject(updatedProject);
          setProject(updatedProject);

          // Navigate to preview screen
          router.push({
            pathname: '/preview',
            params: { id: project.id }
          });
        } else {
          throw new Error('Invalid WASM output format');
        }
      } else {
        throw new Error(result.error || 'Compilation failed');
      }
    } catch (error) {
      setCompilationError(error.message || 'Unknown compilation error');
    } finally {
      setIsCompiling(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleCodeChange = (code) => {
    setProject(prev => ({
      ...prev,
      code
    }));
  };

  const handleSave = async () => {
    if (project) {
      await Storage.saveProject(project);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleSave} style={styles.toolbarButton}>
          <Ionicons name="save-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCompile}
          style={[styles.toolbarButton, styles.compileButton]}
          disabled={isCompiling}
        >
          {isCompiling ? (
            <Text style={styles.compileText}>{Math.round(compilationProgress)}%</Text>
          ) : (
            <Ionicons name="play-outline" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {compilationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{compilationError}</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        style={styles.editor}
        source={{
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js"></script>
                <style>
                  body, html {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    overflow: hidden;
                  }
                  #container {
                    height: 100%;
                  }
                </style>
              </head>
              <body>
                <div id="container"></div>
                <script>
                  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' }});
                  require(['vs/editor/editor.main'], function() {
                    const editor = monaco.editor.create(document.getElementById('container'), {
                      value: '',
                      language: 'typescript',
                      theme: 'vs-dark',
                      automaticLayout: true,
                      minimap: { enabled: false }
                    });

                    // Notify parent when ready
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'editorReady'
                    }));

                    // Handle code changes
                    editor.onDidChangeModelContent(() => {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'codeChange',
                        code: editor.getValue()
                      }));
                    });

                    // Handle messages from parent
                    window.addEventListener('message', (event) => {
                      const data = JSON.parse(event.data);
                      if (data.type === 'setCode') {
                        editor.setValue(data.code);
                      }
                    });
                  });
                </script>
              </body>
            </html>
          `
        }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#252526',
    borderBottomWidth: 1,
    borderBottomColor: '#373737',
  },
  toolbarButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  compileButton: {
    backgroundColor: '#007acc',
  },
  compileText: {
    color: 'white',
    fontSize: 14,
  },
  editor: {
    flex: 1,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ff4444',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
  },
});

export default CodeEditor;
