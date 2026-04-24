import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Storage from '../../lib/storage';

const WasmPreview = () => {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    const loadProject = async () => {
      if (id) {
        const loadedProject = await Storage.loadProject(id);
        setProject(loadedProject);
      }
      setIsLoading(false);
    };

    loadProject();
  }, [id]);

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'console') {
        setConsoleOutput(prev => [...prev, data.message]);
      } else if (data.type === 'executionTime') {
        setExecutionTime(data.time);
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!project || !project.wasmBytes) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No compiled WASM module available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleRefresh} style={styles.toolbarButton}>
          <Ionicons name="refresh-outline" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.metricsContainer}>
          {executionTime !== null && (
            <Text style={styles.metricText}>Execution: {executionTime}ms</Text>
          )}
        </View>
      </View>

      <WebView
        ref={webViewRef}
        style={styles.preview}
        source={{
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body {
                    margin: 0;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    background-color: #f5f5f5;
                    color: #333;
                  }
                  #output {
                    margin-top: 20px;
                    padding: 15px;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  .error {
                    color: #d32f2f;
                  }
                </style>
              </head>
              <body>
                <h1>${project.name}</h1>
                <div id="output">
                  <p>Loading WASM module...</p>
                </div>

                <script>
                  // Override console methods to send to parent
                  const originalConsole = {
                    log: console.log,
                    error: console.error,
                    warn: console.warn
                  };

                  console.log = function(...args) {
                    originalConsole.log.apply(console, args);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'console',
                      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString()).join(' ')
                    }));
                  };

                  console.error = function(...args) {
                    originalConsole.error.apply(console, args);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'console',
                      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString()).join(' '),
                      isError: true
                    }));
                  };

                  // Load and execute WASM
                  const startTime = performance.now();

                  fetch('data:application/wasm;base64,${btoa(String.fromCharCode(...project.wasmBytes))}')
                    .then(response => response.arrayBuffer())
                    .then(bytes => WebAssembly.instantiate(bytes))
                    .then(results => {
                      const endTime = performance.now();
                      const executionTime = endTime - startTime;

                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'executionTime',
                        time: Math.round(executionTime)
                      }));

                      document.getElementById('output').innerHTML = '<p>WASM module loaded successfully!</p>' +
                        '<p>Execution time: ' + Math.round(executionTime) + 'ms</p>' +
                        '<p>Exports: ' + Object.keys(results.instance.exports).join(', ') + '</p>';

                      // Call any exported functions if they exist
                      if (results.instance.exports.run) {
                        try {
                          results.instance.exports.run();
                        } catch (e) {
                          console.error('Error calling run function:', e);
                        }
                      }
                    })
                    .catch(error => {
                      console.error('Error loading WASM module:', error);
                      document.getElementById('output').innerHTML =
                        '<p class="error">Error loading WASM module: ' + error.message + '</p>';
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

      <View style={styles.consoleContainer}>
        <View style={styles.consoleHeader}>
          <Text style={styles.consoleTitle}>Console Output</Text>
          <TouchableOpacity onPress={clearConsole}>
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.consoleContent}>
          {consoleOutput.map((log, index) => (
            <Text
              key={index}
              style={[styles.consoleLine, log.isError && styles.consoleError]}
            >
              {log.message}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  metricsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  metricText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
  preview: {
    flex: 1,
  },
  consoleContainer: {
    height: 200,
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#373737',
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#252526',
    borderBottomWidth: 1,
    borderBottomColor: '#373737',
  },
  consoleTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  consoleContent: {
    flex: 1,
    padding: 10,
  },
  consoleLine: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  consoleError: {
    color: '#ff4444',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default WasmPreview;
