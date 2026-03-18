import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { debounce } from 'lodash';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onSave: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onSave }) => {
  const webViewRef = useRef<WebView>(null);
  const debouncedSave = useRef(debounce(onSave, 1000));

  useEffect(() => {
    if (webViewRef.current) {
      // Update the editor content when code prop changes
      webViewRef.current.injectJavaScript(`
        if (window.editor) {
          window.editor.setValue(\`${code}\`);
        }
        true;
      `);
    }
  }, [code]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TypeBridge Editor</title>
        <link rel="stylesheet" data-name="vs/editor/editor.main" 
              href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/editor/editor.main.min.css">
      </head>
      <body style="margin: 0; padding: 0;">
        <div id="container" style="width: 100%; height: 100vh;"></div>
        
        <script>
          // Load Monaco AMD loader
          var require = {
            paths: {
              'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs'
            }
          };
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.js"></script>
        <script>
          require(['vs/editor/editor.main'], function() {
            window.editor = monaco.editor.create(document.getElementById('container'), {
              value: \`${code}\`,
              language: 'typescript',
              theme: 'vs-dark',
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2
            });
            
            // Listen for changes and send to React Native
            window.editor.onDidChangeModelContent(function(e) {
              const currentCode = window.editor.getValue();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'codeChange',
                code: currentCode
              }));
              
              // Also trigger debounced save
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'debouncedSave',
                code: currentCode
              }));
            });
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'codeChange') {
        onChange(message.code);
      } else if (message.type === 'debouncedSave') {
        debouncedSave.current(message.code);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CodeEditor;
