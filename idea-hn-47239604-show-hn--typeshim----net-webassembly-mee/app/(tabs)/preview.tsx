import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { loadProject } from '../../lib/storage';
import { useLocalSearchParams } from 'expo-router';

const WasmPreview = () => {
  const { projectId } = useLocalSearchParams();
  const [wasmBytes, setWasmBytes] = useState<Uint8Array | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadWasm = async () => {
      if (projectId) {
        const project = await loadProject(projectId);
        if (project?.wasmBytes) {
          setWasmBytes(project.wasmBytes);
        }
      }
    };
    loadWasm();
  }, [projectId]);

  const handleRun = () => {
    if (!wasmBytes) return;

    setIsRunning(true);
    setConsoleOutput([]);

    // Convert WASM bytes to base64 for WebView
    const wasmBase64 = btoa(String.fromCharCode.apply(null, wasmBytes));

    // Inject WASM module and run it
    const script = `
      (async () => {
        try {
          // Load WASM module
          const wasmBytes = Uint8Array.from(atob('${wasmBase64}'), c => c.charCodeAt(0));
          const wasmModule = await WebAssembly.instantiate(wasmBytes, {
            env: {
              abort: () => { throw new Error('WASM abort called'); },
              log: (ptr, len) => {
                const memory = new Uint8Array(instance.exports.memory.buffer);
                const message = new TextDecoder().decode(memory.subarray(ptr, ptr + len));
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'consoleOutput',
                  message: message
                }));
              }
            }
          });

          const instance = wasmModule.instance;

          // Execute the WASM module
          if (instance.exports._start) {
            instance.exports._start();
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'runComplete'
          }));
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: error.message || 'Unknown error'
          }));
        }
      })();
    `;

    webViewRef.current?.injectJavaScript(script);
  };

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.type === 'consoleOutput') {
      setConsoleOutput(prev => [...prev, data.message]);
    } else if (data.type === 'runComplete') {
      setIsRunning(false);
    } else if (data.type === 'error') {
      setConsoleOutput(prev => [...prev, `ERROR: ${data.message}`]);
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: '<html><body></body></html>' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        style={styles.webView}
      />

      <View style={styles.consoleContainer}>
        <View style={styles.consoleHeader}>
          <Text style={styles.consoleTitle}>Console Output</Text>
          <TouchableOpacity
            style={styles.runButton}
            onPress={handleRun}
            disabled={!wasmBytes || isRunning}
          >
            <Text style={styles.runButtonText}>
              {isRunning ? 'Running...' : 'Run WASM'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.console}
          contentContainerStyle={styles.consoleContent}
        >
          {consoleOutput.map((line, index) => (
            <Text key={index} style={styles.consoleLine}>
              {line}
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
    backgroundColor: '#1e1e1e',
  },
  webView: {
    flex: 1,
    backgroundColor: 'white',
  },
  consoleContainer: {
    height: 200,
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#373737',
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#373737',
  },
  consoleTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  runButton: {
    backgroundColor: '#007acc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  runButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  console: {
    flex: 1,
  },
  consoleContent: {
    padding: 10,
  },
  consoleLine: {
    color: 'white',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

export default WasmPreview;
