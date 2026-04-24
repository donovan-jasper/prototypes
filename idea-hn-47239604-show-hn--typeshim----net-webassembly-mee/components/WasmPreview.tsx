import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { getProjectById } from '../lib/database';

interface WasmPreviewProps {
  projectId: string;
}

export default function WasmPreview({ projectId }: WasmPreviewProps) {
  const [wasmBytes, setWasmBytes] = useState<Uint8Array | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
              const exports = wasmModule.instance.exports;

              // Look for and call main function if it exists
              if (exports._start) {
                exports._start();
              } else if (exports.main) {
                exports.main();
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
          <WebView
            ref={webViewRef}
            source={{ html: wasmRuntimeHtml }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'console') {
                  handleConsoleOutput(`[${data.level}] ${data.message}`);
                } else if (data.type === 'error') {
                  setError(data.message);
                }
              } catch (err) {
                console.error('Error parsing WebView message:', err);
              }
            }}
            javaScriptEnabled={true}
            style={styles.webview}
            originWhitelist={['*']}
            injectedJavaScript={wasmBytes ? `
              window.postMessage({
                type: 'setWasmBytes',
                wasmBytes: ${JSON.stringify(Array.from(wasmBytes))}
              }, '*');
            ` : ''}
          />

          <View style={styles.consoleContainer}>
            <Text style={styles.consoleTitle}>Console Output</Text>
            <ScrollView style={styles.consoleOutput}>
              {consoleOutput.map((line, index) => (
                <Text
                  key={index}
                  style={[
                    styles.consoleLine,
                    line.includes('[error]') && styles.consoleError,
                    line.includes('[warn]') && styles.consoleWarn
                  ]}
                >
                  {line}
                </Text>
              ))}
            </ScrollView>
          </View>
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
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
  consoleContainer: {
    height: 200,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  consoleTitle: {
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: '#eee',
  },
  consoleOutput: {
    flex: 1,
    padding: 10,
  },
  consoleLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  consoleError: {
    color: '#d32f2f',
  },
  consoleWarn: {
    color: '#ff9800',
  },
});
