import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { loadProject } from '../../lib/storage';

const PreviewScreen = () => {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        const loadedProject = await loadProject(projectId);
        setProject(loadedProject);
      }
    };
    loadProjectData();
  }, [projectId]);

  const handleRefresh = () => {
    setConsoleOutput([]);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'console') {
        setConsoleOutput(prev => [...prev, message.message]);
      } else if (message.type === 'error') {
        setConsoleOutput(prev => [...prev, `ERROR: ${message.message}`]);
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
        <title>TypeScript Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 16px;
            margin: 0;
          }
          #output {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            margin-top: 16px;
            min-height: 100px;
          }
        </style>
      </head>
      <body>
        <h2>TypeScript Playground</h2>
        <div id="output"></div>
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/typescript/5.3.3/typescript.min.js"></script>
        <script>
          // Override console.log to capture output
          const originalLog = console.log;
          const originalError = console.error;
          const outputDiv = document.getElementById('output');
          
          console.log = function(...args) {
            const message = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            
            originalLog.apply(console, args);
            
            const p = document.createElement('p');
            p.textContent = message;
            p.style.margin = '4px 0';
            outputDiv.appendChild(p);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'console',
              message: message
            }));
          };
          
          console.error = function(...args) {
            const message = args.map(arg => String(arg)).join(' ');
            
            originalError.apply(console, args);
            
            const p = document.createElement('p');
            p.textContent = 'ERROR: ' + message;
            p.style.margin = '4px 0';
            p.style.color = 'red';
            outputDiv.appendChild(p);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: message
            }));
          };
          
          // Compile and execute TypeScript
          try {
            const tsCode = \`${project.code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
            
            // Compile TypeScript to JavaScript
            const result = ts.transpileModule(tsCode, {
              compilerOptions: {
                module: ts.ModuleKind.None,
                target: ts.ScriptTarget.ES2015,
                lib: ['es2015', 'dom']
              }
            });
            
            // Execute the compiled JavaScript
            eval(result.outputText);
            
          } catch (error) {
            console.error('Execution error:', error.message);
          }
        </script>
      </body>
    </html>
  ` : '';

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        {project && (
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
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
            <Text style={styles.emptyText}>No output yet. Run your code to see results.</Text>
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
