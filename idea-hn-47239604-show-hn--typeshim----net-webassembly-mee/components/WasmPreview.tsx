import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';

interface WasmPreviewProps {
  wasmBytes: Uint8Array;
  onConsoleOutput?: (output: string) => void;
}

const WasmPreview: React.FC<WasmPreviewProps> = ({ wasmBytes, onConsoleOutput }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const webViewRef = useRef<WebView>(null);

  const runWasm = () => {
    setIsRunning(true);
    setConsoleOutput([]);

    // Convert WASM bytes to base64 for WebView
    const wasmBase64 = btoa(String.fromCharCode.apply(null, Array.from(wasmBytes)));

    webViewRef.current?.postMessage(JSON.stringify({
      type: 'runWasm',
      wasmBase64
    }));
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'consoleOutput') {
        const newOutput = [...consoleOutput, data.message];
        setConsoleOutput(newOutput);
        if (onConsoleOutput) {
          onConsoleOutput(data.message);
        }
      }

      if (data.type === 'wasmExecutionComplete') {
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: monospace;
            margin: 0;
            padding: 10px;
            background-color: #1e1e1e;
            color: #d4d4d4;
          }
          #output {
            white-space: pre-wrap;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div id="output"></div>
        <script>
          window.addEventListener('message', async (event) => {
            if (event.data.type === 'runWasm') {
              try {
                const wasmBase64 = event.data.wasmBase64;
                const wasmBytes = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));

                // Override console.log to send messages to React Native
                const originalConsoleLog = console.log;
                console.log = function(...args) {
                  originalConsoleLog.apply(console, args);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'consoleOutput',
                    message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
                  }));
                };

                // Create a WebAssembly instance
                const wasmModule = await WebAssembly.instantiate(wasmBytes, {
                  env: {
                    abort: () => {
                      throw new Error('WASM abort called');
                    }
                  }
                });

                // If there's an exported main function, call it
                if (wasmModule.instance.exports.main) {
                  wasmModule.instance.exports.main();
                }

                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'wasmExecutionComplete'
                }));
              } catch (error) {
                console.error('WASM execution error:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'consoleOutput',
                  message: 'Error: ' + error.message
                }));
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'wasmExecutionComplete'
                }));
              }
            }
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
          style={styles.runButton}
          onPress={runWasm}
          disabled={isRunning}
        >
          <Text style={styles.runButtonText}>{isRunning ? 'Running...' : 'Run WASM'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.consoleContainer}>
        <Text style={styles.consoleTitle}>Console Output</Text>
        <ScrollView style={styles.consoleOutput}>
          {consoleOutput.map((line, index) => (
            <Text key={index} style={styles.consoleLine}>{line}</Text>
          ))}
        </ScrollView>
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
    backgroundColor: '#1e1e1e',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#3e3e42',
  },
  runButton: {
    backgroundColor: '#007acc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  runButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  consoleContainer: {
    height: 200,
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#3e3e42',
  },
  consoleTitle: {
    color: '#d4d4d4',
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#252526',
  },
  consoleOutput: {
    flex: 1,
    padding: 10,
  },
  consoleLine: {
    color: '#d4d4d4',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default WasmPreview;
