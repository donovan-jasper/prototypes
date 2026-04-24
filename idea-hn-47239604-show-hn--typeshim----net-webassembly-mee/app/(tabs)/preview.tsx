import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { getProjectById } from '../../lib/database';

export default function PreviewScreen({ route }) {
  const { projectId } = route.params;
  const [wasmBytes, setWasmBytes] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    const project = await getProjectById(projectId);
    if (project.wasmBytes) {
      setWasmBytes(project.wasmBytes);
    }
    setIsLoading(false);
  };

  const handleConsoleMessage = (event) => {
    const message = event.nativeEvent.data;
    setConsoleOutput(prev => [...prev, message]);
  };

  const runWasm = () => {
    // Reset console
    setConsoleOutput([]);
    // Trigger WebView to re-run WASM
    webViewRef.current?.injectJavaScript(`
      runWasm();
      true;
    `);
  };

  const webViewRef = React.useRef(null);

  const wasmRunnerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@assemblyscript/loader@0.27.2/dist/loader.umd.js"></script>
        <style>
          body { margin: 0; padding: 20px; font-family: monospace; }
          .output { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div id="output" class="output"></div>
        <script>
          const outputElement = document.getElementById('output');

          // Override console.log to send messages to React Native
          const originalLog = console.log;
          console.log = function(...args) {
            originalLog.apply(console, args);
            window.ReactNativeWebView.postMessage(args.join(' '));
          };

          // Load and run WASM
          async function runWasm() {
            try {
              const wasmBytes = ${JSON.stringify(Array.from(wasmBytes || []))};
              const wasmModule = await WebAssembly.instantiate(
                new Uint8Array(wasmBytes),
                {
                  env: {
                    abort: () => { throw new Error('WASM aborted'); }
                  }
                }
              );

              // Call the exported function if it exists
              if (wasmModule.instance.exports.run) {
                wasmModule.instance.exports.run();
              }
            } catch (error) {
              console.error('WASM execution failed:', error);
            }
          }

          // Initial run
          runWasm();
        </script>
      </body>
    </html>
  `;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading WASM module...</Text>
      </View>
    );
  }

  if (!wasmBytes) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No compiled WASM module found. Please compile your code first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: wasmRunnerHtml }}
        onMessage={handleConsoleMessage}
        javaScriptEnabled={true}
        style={styles.webview}
      />

      <View style={styles.consoleContainer}>
        <View style={styles.consoleHeader}>
          <Text style={styles.consoleTitle}>Console Output</Text>
          <TouchableOpacity onPress={runWasm} style={styles.runButton}>
            <Text style={styles.runButtonText}>Run</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.consoleOutput}>
          {consoleOutput.map((line, index) => (
            <Text key={index} style={styles.consoleLine}>{line}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webview: {
    flex: 1,
  },
  consoleContainer: {
    height: 200,
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#252526',
  },
  consoleTitle: {
    color: '#ccc',
    fontWeight: 'bold',
  },
  runButton: {
    backgroundColor: '#007acc',
    padding: 8,
    borderRadius: 4,
  },
  runButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  consoleOutput: {
    flex: 1,
    padding: 10,
  },
  consoleLine: {
    color: 'white',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
});
