import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

interface WasmPreviewProps {
  wasmBytes: Uint8Array;
  onConsoleOutput?: (output: string) => void;
  onError?: (error: string) => void;
}

const WasmPreview: React.FC<WasmPreviewProps> = ({ wasmBytes, onConsoleOutput, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (wasmBytes && wasmBytes.length > 0) {
      setIsLoading(true);
      // Load WASM when component mounts or wasmBytes changes
      loadWasm();
    }
  }, [wasmBytes]);

  const loadWasm = () => {
    const startTime = performance.now();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #f5f5f5;
            }
            #output {
              margin-top: 20px;
              padding: 10px;
              background-color: #282c34;
              color: #abb2bf;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
              overflow-y: auto;
              max-height: 300px;
            }
            .error {
              color: #e06c75;
            }
          </style>
        </head>
        <body>
          <div id="output"></div>
          <script>
            (async () => {
              try {
                // Create a blob URL for the WASM module
                const wasmBlob = new Blob([new Uint8Array(${JSON.stringify(Array.from(wasmBytes))})], { type: 'application/wasm' });
                const wasmUrl = URL.createObjectURL(wasmBlob);

                // Override console.log to send messages to React Native
                const originalConsoleLog = console.log;
                console.log = (...args) => {
                  originalConsoleLog(...args);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'consoleOutput',
                    output: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
                  }));
                };

                // Load and instantiate the WASM module
                const response = await fetch(wasmUrl);
                const bytes = await response.arrayBuffer();
                const { instance } = await WebAssembly.instantiate(bytes, {
                  env: {
                    abort: () => {
                      throw new Error('WASM module aborted');
                    }
                  }
                });

                // Notify React Native that WASM is loaded
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'wasmLoaded',
                  executionTime: ${performance.now() - startTime}
                }));

                // If there's a main function, execute it
                if (instance.exports.main) {
                  instance.exports.main();
                }
              } catch (error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'wasmError',
                  error: error.message || 'Failed to load WASM module'
                }));
              }
            })();
          </script>
        </body>
      </html>
    `;

    webViewRef.current?.injectJavaScript(`
      document.open();
      document.write(${JSON.stringify(html)});
      document.close();
      true;
    `);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'consoleOutput' && onConsoleOutput) {
        onConsoleOutput(data.output);
      }

      if (data.type === 'wasmError' && onError) {
        onError(data.error);
        setIsLoading(false);
      }

      if (data.type === 'wasmLoaded') {
        setExecutionTime(data.executionTime);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadWasm();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        style={styles.webview}
      />
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading WASM module...</Text>
        </View>
      )}
      {executionTime !== null && (
        <View style={styles.performance}>
          <Text style={styles.performanceText}>Execution time: {executionTime.toFixed(2)}ms</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
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
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  performance: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 14,
    color: '#333',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  refreshText: {
    color: 'white',
    fontSize: 14,
  },
});

export default WasmPreview;
