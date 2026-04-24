import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { compileTypeScriptToWasm, cleanupCompiler, getCompilationProgress } from '../lib/compiler';

interface CodeEditorProps {
  initialCode: string;
  onCompile: (result: { success: boolean; wasmBytes?: Uint8Array; error?: string }) => void;
  onProgress?: (progress: number) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, onCompile, onProgress }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [currentCode, setCurrentCode] = useState(initialCode);
  const webViewRef = useRef<WebView>(null);
  const [editorReady, setEditorReady] = useState(false);
  const compilationRequestId = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      cleanupCompiler();
    };
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'editorReady') {
        setEditorReady(true);
        // Initialize editor with code
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'setCode',
          code: initialCode
        }));
      }

      if (data.type === 'codeChange') {
        setCurrentCode(data.code);
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  const handleCompile = async () => {
    if (!editorReady) return;

    setIsCompiling(true);
    setCompilationProgress(0);
    compilationRequestId.current = null;

    try {
      // Get current code from editor
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'getCode'
      }));

      // Wait for code response
      const codeResponse = await new Promise<string>((resolve) => {
        const listener = (event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'currentCode') {
              webViewRef.current?.removeEventListener('message', listener);
              resolve(data.code);
            }
          } catch (error) {
            console.error('Error getting current code:', error);
          }
        };
        webViewRef.current?.addEventListener('message', listener);
      });

      // Start compilation with progress updates
      const updateProgress = (progress: number) => {
        setCompilationProgress(progress);
        if (onProgress) onProgress(progress);
      };

      updateProgress(10); // Initial progress

      const result = await compileTypeScriptToWasm(codeResponse);
      compilationRequestId.current = result.requestId;

      // Start progress tracking
      const progressInterval = setInterval(() => {
        if (compilationRequestId.current) {
          const progress = getCompilationProgress(compilationRequestId.current);
          updateProgress(progress);

          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }
      }, 200);

      onCompile(result);
      updateProgress(100);
    } catch (error) {
      onCompile({ success: false, error: error.message || 'Compilation failed' });
    } finally {
      setIsCompiling(false);
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            const container = document.getElementById('container');
            const editor = monaco.editor.create(container, {
              value: '',
              language: 'typescript',
              theme: 'vs-dark',
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14
            });

            // Notify parent when ready
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'editorReady'
            }));

            // Handle messages from React Native
            window.addEventListener('message', (event) => {
              const data = event.data;
              if (data.type === 'setCode') {
                editor.setValue(data.code);
              } else if (data.type === 'getCode') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'currentCode',
                  code: editor.getValue()
                }));
              }
            });

            // Send code changes to React Native
            editor.onDidChangeModelContent(() => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'codeChange',
                code: editor.getValue()
              }));
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
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        style={styles.webView}
      />

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.compileButton}
          onPress={handleCompile}
          disabled={isCompiling}
        >
          {isCompiling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.compileButtonText}>Compile</Text>
          )}
        </TouchableOpacity>

        {isCompiling && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Compiling: {compilationProgress}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#3e3e42',
  },
  compileButton: {
    backgroundColor: '#007acc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  compileButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default CodeEditor;
