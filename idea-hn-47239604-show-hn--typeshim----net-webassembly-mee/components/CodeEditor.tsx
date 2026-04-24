import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { compileTypeScriptToWasm, cleanupCompiler } from '../lib/compiler';

interface CodeEditorProps {
  initialCode: string;
  onCompile: (result: { success: boolean; wasmBytes?: Uint8Array; error?: string }) => void;
  onProgress?: (progress: number) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, onCompile, onProgress }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const webViewRef = useRef<WebView>(null);
  const [editorReady, setEditorReady] = useState(false);

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
        // Handle code changes if needed
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  const handleCompile = async () => {
    if (!editorReady) return;

    setIsCompiling(true);
    setCompilationProgress(0);

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

      updateProgress(90); // Almost done

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
        style={styles.webview}
      />
      {isCompiling && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.progressText}>{Math.round(compilationProgress)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});

export default CodeEditor;
