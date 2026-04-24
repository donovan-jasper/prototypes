import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { compileTypeScriptToWasm } from '../../lib/compiler';
import { updateProject } from '../../lib/database';

export default function EditorScreen({ route }) {
  const { projectId } = route.params;
  const [code, setCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    // Load project code
    loadProject();
  }, []);

  const loadProject = async () => {
    const project = await getProjectById(projectId);
    setCode(project.code);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Auto-save every 3 seconds
    const timeout = setTimeout(() => saveProject(newCode), 3000);
    return () => clearTimeout(timeout);
  };

  const saveProject = async (codeToSave) => {
    await updateProject({ id: projectId, code: codeToSave });
  };

  const compileCode = async () => {
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
        // Navigate to preview screen
      } else {
        setCompilationError(result.error);
      }
    } catch (error) {
      setCompilationError(error.message);
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
              automaticLayout: true
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
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'codeChange') {
            handleCodeChange(data.code);
          }
        }}
        javaScriptEnabled={true}
        style={styles.editor}
      />

      {compilationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{compilationError}</Text>
        </View>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.button}
          onPress={compileCode}
          disabled={isCompiling}
        >
          {isCompiling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Compile</Text>
          )}
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
    backgroundColor: '#007acc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
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
  },
});
