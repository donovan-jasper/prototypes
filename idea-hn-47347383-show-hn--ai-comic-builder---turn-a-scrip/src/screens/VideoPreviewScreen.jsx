import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import VideoPreview from '../components/VideoPreview';
import { processScriptToVideo } from '../utils/videoProcessor';

const VideoPreviewScreen = () => {
  const [scenes, setScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // A default script for demonstration purposes
  const defaultScript = `
Scene 1: A majestic forest with tall trees and a sparkling stream. A curious squirrel peeks from behind a tree.
Scene 2: A sunny beach, waves gently lapping the shore. A person walks along the sand, a dog running beside them.
Scene 3: A bustling city street at night. Bright lights and tall buildings. A cat sits on a window ledge.
Scene 4: Deep space, with countless stars and a distant nebula. A lone astronaut floats by.
Scene 5: A cozy living room in a house. A family gathers around a fireplace. A robot serves tea.
Scene 6: High up in the mountains, covered in fresh snow. A bird flies overhead.
Scene 7: A vast desert with towering sand dunes. A lone cactus stands tall.
`;

  useEffect(() => {
    const fetchScenes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, the script would come from navigation params or global state
        // For this prototype, we use a default script.
        const result = await processScriptToVideo(defaultScript);
        setScenes(result.scenes);
      } catch (err) {
        console.error("Failed to process script:", err);
        setError("Failed to generate video preview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenes();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Video Preview</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BFFF" />
            <Text style={styles.loadingText}>Generating scenes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <VideoPreview scenes={scenes} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#222',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, // Ensure it takes up some space
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default VideoPreviewScreen;
