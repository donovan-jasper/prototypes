import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import VideoPreview from '../components/VideoPreview';
import { processScriptToVideo } from '../utils/videoProcessor';
import { useRoute } from '@react-navigation/native';

const VideoPreviewScreen = () => {
  const [scenes, setScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();

  useEffect(() => {
    const fetchScenes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const script = route.params.script;
        const result = await processScriptToVideo(script);
        setScenes(result.scenes);
      } catch (err) {
        console.error("Failed to process script:", err);
        setError("Failed to generate video preview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenes();
  }, [route.params.script]); // Re-run when script changes

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
