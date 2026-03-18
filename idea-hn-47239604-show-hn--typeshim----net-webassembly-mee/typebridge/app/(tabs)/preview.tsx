import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { loadProject, saveProject } from '../../lib/storage';

const PreviewScreen = () => {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationStatus, setCompilationStatus] = useState('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        const loadedProject = await loadProject(projectId);
        setProject(loadedProject);
        if (loadedProject) {
          setConsoleOutput([`Loading project: ${loadedProject.name}`]);
        }
      }
    };
    loadProjectData();
  }, [projectId]);

  const handleRefresh = () => {
    setConsoleOutput([]);
    setCompilationStatus('');
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'console') {
        setConsoleOutput(prev => [...prev, message.message]);
      } else if (message.type === 'error') {
        setConsoleOutput(prev => [...prev, `ERROR: ${message.message}`]);
      } else if (message.type === 'compilationStart') {
        setIsCompiling(true);
        setCompilationStatus('Compiling AssemblyScript to WASM...');
        setConsoleOutput(prev => [...prev, '🔨 Starting WASM compilation...']);
      } else if (message.type === 'compilationSuccess') {
        setIsCompiling(false);
        setCompilationStatus('Compilation successful!');
        setConsoleOutput(prev => [...prev, '✅ WASM compilation successful!']);
        setConsoleOutput(prev => [...prev, `📦 WASM size: ${message.wasmSize} bytes`]);
        
        // Save the compiled WASM bytes to the project
        if (project && message.wasmBase64) {
          const wasmBytes = Uint8Array.from(atob(message.wasmBase64), c => c.charCodeAt(0));
          const updatedProject = {
            ...project,
            wasmBytes: Array.from(wasmBytes),
            updatedAt: Date.now()
          };
          await saveProject(updatedProject);
          setProject(updatedProject);
        }
      } else if (message.type === 'compilationError') {
        setIsCompiling(false);
        setCompilationStatus('Compilation failed');
        setConsoleOutput(prev => [...prev, `❌ Compilation error: ${message.error}`]);
      } else if (message.type === 'wasmExecution') {
        setConsoleOutput(prev => [...prev, `🚀 Executing WASM function: ${message.function}`]);
        setConsoleOutput(prev => [...prev, `   Result: ${message.result}`]);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const htmlContent = project ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WASM Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 16px;
            margin: 0;
            background: #f5f5f5;
          }
          #output {
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .result {
            background: #e8f5e9;
            padding: 8px 12px;
            border-radius: 4px;
            margin: 8px 0;
            border-left: 4px solid #4caf50;
          }
          .error {
            background: #ffebee;
            padding: 8px 12px;
            border-radius: 4px;
            margin: 8px 0;
            border-left: 4px solid #f44336;
            color: #c62828;
          }
        </style>
      </head>
      <body>
        <h2>WebAssembly Execution</h2>
        <div id="output"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/assemblyscript@0.27.0/dist/assemblyscript.js"></script>
        <script>
          const outputDiv = document.getElementById('output');
          
          function log(message, isError = false) {
            const p = document.createElement('p');
            p.textContent = message;
            p.className = isError ? 'error' : 'result';
            outputDiv.appendChild(p);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: isError ? 'error' : 'console',
              message: message
            }));
          }
          
          async function compileAndRun() {
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'compilationStart'
              }));
              
              const sourceCode = \`${project.code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
              
              // Use AssemblyScript compiler
              const asc = assemblyscript;
              
              // Compile options
              const options = {
                stdout: asc.createMemoryStream(),
                stderr: asc.createMemoryStream(),
                optimize: true,
                runtime: 'stub'
              };
              
              // Compile AssemblyScript to WASM
              const { error, binary, text } = await asc.compileString(sourceCode, options);
              
              if (error) {
                const errorText = asc.readString(options.stderr);
                throw new Error(errorText || 'Compilation failed');
              }
              
              if (!binary || binary.length === 0) {
                throw new Error('No WASM binary generated');
              }
              
              // Validate WASM magic number
              const magicNumber = new Uint8Array([0x00, 0x61, 0x73, 0x6d]);
              const isValidWasm = binary.slice(0, 4).every((val, i) => val === magicNumber[i]);
              
              if (!isValidWasm) {
                throw new Error('Invalid WASM binary generated');
              }
              
              // Convert binary to base64 for storage
              const wasmBase64 = btoa(String.fromCharCode.apply(null, binary));
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'compilationSuccess',
                wasmSize: binary.length,
                wasmBase64: wasmBase64
              }));
              
              // Instantiate and run the WASM module
              const wasmModule = await WebAssembly.instantiate(binary, {
                env: {
                  abort: (msg, file, line, column) => {
                    log(\`Abort: \${msg} at \${file}:\${line}:\${column}\`, true);
                  }
                }
              });
              
              const exports = wasmModule.instance.exports;
              
              // Test exported functions
              log('Testing exported WASM functions:');
              
              if (exports.add) {
                const result = exports.add(5, 3);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'wasmExecution',
                  function: 'add(5, 3)',
                  result: result
                }));
                log(\`add(5, 3) = \${result}\`);
              }
              
              if (exports.multiply) {
                const result = exports.multiply(4, 7);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'wasmExecution',
                  function: 'multiply(4, 7)',
                  result: result
                }));
                log(\`multiply(4, 7) = \${result}\`);
              }
              
              if (exports.fibonacci) {
                const result = exports.fibonacci(10);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'wasmExecution',
                  function: 'fibonacci(10)',
                  result: result
                }));
                log(\`fibonacci(10) = \${result}\`);
              }
              
              // List all exports
              const exportNames = Object.keys(exports).filter(name => typeof exports[name] === 'function');
              if (exportNames.length > 0) {
                log(\`Available functions: \${exportNames.join(', ')}\`);
              }
              
            } catch (error) {
              log(error.message, true);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'compilationError',
                error: error.message
              }));
            }
          }
          
          // Start compilation when page loads
          compileAndRun();
        </script>
      </body>
    </html>
  ` : '';

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        {isCompiling ? (
          <View style={styles.statusContent}>
            <ActivityIndicator size="small" color="#6200ee" />
            <Text style={styles.statusText}>{compilationStatus}</Text>
          </View>
        ) : compilationStatus ? (
          <Text style={[styles.statusText, styles.successText]}>{compilationStatus}</Text>
        ) : (
          <Text style={styles.statusText}>Ready to compile</Text>
        )}
      </View>
      
      <View style={styles.webViewContainer}>
        {project && (
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            mixedContentMode="always"
          />
        )}
      </View>
      
      <View style={styles.consoleContainer}>
        <View style={styles.consoleHeader}>
          <Text style={styles.consoleTitle}>Console Output</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.consoleOutput}>
          {consoleOutput.length === 0 ? (
            <Text style={styles.emptyText}>Compiling...</Text>
          ) : (
            consoleOutput.map((line, index) => (
              <Text key={index} style={styles.consoleLine}>{line}</Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBar: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  successText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  webViewContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  consoleContainer: {
    height: 200,
    backgroundColor: '#1e1e1e',
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#3e3e3e',
  },
  consoleTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  refreshButton: {
    padding: 6,
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  consoleOutput: {
    flex: 1,
    padding: 8,
  },
  consoleLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#d4d4d4',
    marginBottom: 4,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: 12,
  },
});

export default PreviewScreen;
