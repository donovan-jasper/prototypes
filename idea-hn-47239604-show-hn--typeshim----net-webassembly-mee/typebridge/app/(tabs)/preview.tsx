import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { loadProject } from '../../lib/storage';
import ConsoleOutput from '../../components/ConsoleOutput';

const PreviewScreen = () => {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        const loadedProject = await loadProject(projectId);
        setProject(loadedProject);
      }
    };
    loadProjectData();
  }, [projectId]);

  const handleConsoleMessage = (message) => {
    setConsoleOutput(prev => [...prev, message]);
  };

  return (
    <View style={styles.container}>
      {project && (
        <WebView
          source={{ html: `
            <!DOCTYPE html>
            <html>
              <head>
                <script>
                  // WASM execution code
                  // Capture console.log and send to React Native
                </script>
              </head>
              <body>
                <script>
                  // Load and execute WASM
                </script>
              </body>
            </html>
          ` }}
          onMessage={(event) => {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'console') {
              handleConsoleMessage(message.message);
            }
          }}
        />
      )}
      <ConsoleOutput output={consoleOutput} />
      <TouchableOpacity style={styles.refreshButton}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    padding: 8,
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
  },
});

export default PreviewScreen;
