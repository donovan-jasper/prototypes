import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView, TouchableOpacity, Picker } from 'react-native';
import { WebView } from 'react-native-webview';
import { getProjectById } from '../../lib/database';

interface WasmPreviewProps {
  projectId: string;
}

export default function WasmPreview({ projectId }: WasmPreviewProps) {
  const [wasmBytes, setWasmBytes] = useState<Uint8Array | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exports, setExports] = useState<string[]>([]);
  const [selectedExport, setSelectedExport] = useState<string>('');
  const [functionParams, setFunctionParams] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    loadWasmBytes();
  }, [projectId]);

  const loadWasmBytes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const project = await getProjectById(projectId);

      if (project?.wasmBytes) {
        setWasmBytes(new Uint8Array(project.wasmBytes));
      } else {
        setError('No compiled WASM found. Please compile your code first.');
      }
    } catch (err) {
      setError('Failed to load WASM module');
      console.error('Error loading WASM:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsoleOutput = (message: string) => {
    setConsoleOutput(prev => [...prev, message]);
  };

  const handleExportsLoaded = (exportsList: string[]) => {
    setExports(exportsList);
    if (exportsList.length > 0) {
      setSelectedExport(exportsList[0]);
    }
  };

  const runSelectedFunction = () => {
    if (webViewRef.current && selectedExport) {
      webViewRef.current.injectJavaScript(`
        (function() {
          try {
            if (window.wasmModule && window.wasmModule.exports) {
              const func = window.wasmModule.exports['${selectedExport}'];
              if (typeof func === 'function') {
                const params = ${functionParams || '[]'};
                const result = func.apply(null, params);
                console.log('Function ${selectedExport} executed with result:', result);
              } else {
                console.error('Selected export is not a function');
              }
            } else {
              console.error('WASM module not loaded');
            }
          } catch (err) {
            console.error('Error executing function:', err);
          }
        })();
      `);
    }
  };

  const wasmRuntimeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 20px; font-family: monospace; background: #f5f5f5; }
          #output { white-space: pre-wrap; font-size: 14px; }
          .error { color: #d32f2f; }
        </style>
      </head>
      <body>
        <div id="output"></div>
        <script>
          const outputElement = document.getElementById('output');

          // Override console methods
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
          };

          console.log = (...args) => {
            originalConsole.log(...args);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'console',
              level: 'log',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
            }));
          };

          console.error = (...args) => {
            originalConsole.error(...args);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'console',
              level: 'error',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
            }));
          };

          console.warn = (...args) => {
            originalConsole.warn(...args);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'console',
              level: 'warn',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
            }));
          };

          // Load and run WASM
          async function runWasm() {
            try {
              if (!window.wasmBytes) {
                throw new Error('No WASM bytes provided');
              }

              const wasmModule = await WebAssembly.instantiate(window.wasmBytes);
              window.wasmModule = wasmModule;
              const exports = Object.keys(wasmModule.instance.exports);

              // Send exports list to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'exportsLoaded',
                exports: exports
              }));

              // Look for and call main function if it exists
              if (wasmModule.instance.exports._start) {
                wasmModule.instance.exports._start();
              } else if (wasmModule.instance.exports.main) {
                wasmModule.instance.exports.main();
              } else {
                console.log('No main function found in WASM module');
              }
            } catch (err) {
              console.error('Error running WASM:', err);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: err.message
              }));
            }
          }

          // Initialize with WASM bytes from parent
          window.addEventListener('message', (event) => {
            if (event.data.type === 'setWasmBytes') {
              window.wasmBytes = new Uint8Array(event.data.wasmBytes);
              runWasm();
            }
          });

          // Initial load if bytes are already available
          if (window.wasmBytes) {
            runWasm();
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007acc" />
          <Text style={styles.loadingText}>Loading WASM module...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.controlsContainer}>
            <Text style={styles.sectionTitle}>WASM Exports</Text>
            <Picker
              selectedValue={selectedExport}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedExport(itemValue)}
            >
              {exports.map((exp) => (
                <Picker.Item key={exp} label={exp} value={exp} />
              ))}
            </Picker>

            <Text style={styles.sectionTitle}>Parameters (JSON array)</Text>
            <TextInput
              style={styles.input}
              value={functionParams}
              onChangeText={setFunctionParams}
              placeholder="[1, 2, 3]"
            />

            <TouchableOpacity
              style={styles.runButton}
              onPress={runSelectedFunction}
              disabled={!selectedExport}
            >
              <Text style={styles.runButtonText}>Run Function</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.consoleContainer}>
            <Text style={styles.sectionTitle}>Console Output</Text>
            <ScrollView style={styles.consoleOutput}>
              {consoleOutput.map((line, index) => (
                <Text key={index} style={styles.consoleLine}>
                  {line}
                </Text>
              ))}
            </ScrollView>
          </View>

          <WebView
            ref={webViewRef}
            source={{ html: wasmRuntimeHtml }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);

                if (data.type === 'console') {
                  handleConsoleOutput(data.message);
                } else if (data.type === 'error') {
                  setError(data.message);
                } else if (data.type === 'exportsLoaded') {
                  handleExportsLoaded(data.exports);
                }
              } catch (err) {
                console.error('Error parsing WebView message:', err);
              }
            }}
            javaScriptEnabled={true}
            originWhitelist={['*']}
            injectedJavaScript={wasmBytes ? `window.postMessage({ type: 'setWasmBytes', wasmBytes: ${JSON.stringify(Array.from(wasmBytes))} }, '*');` : ''}
            style={styles.webView}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  controlsContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  runButton: {
    backgroundColor: '#007acc',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  runButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  consoleContainer: {
    flex: 1,
    padding: 15,
  },
  consoleOutput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 4,
  },
  consoleLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  webView: {
    height: 0,
    width: 0,
    opacity: 0,
  },
});
