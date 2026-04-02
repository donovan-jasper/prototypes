import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import VideoPreview from '../components/VideoPreview';
import { processScriptToVideo } from '../utils/videoProcessor';

const VideoPreviewScreen = () => {
  const route = useRoute();
  // Extract the 'script' parameter from navigation. If not found, default to an empty string.
  const { script } = route.params || {}; 

  const [videoUri, setVideoUri] = useState(null);
  const [scenes, setScenes] = useState([]); // Store scenes for potential display or future use
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateVideo = async () => {
      if (!script) {
        setError("No script provided. Please go back and enter a script to generate a video.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        // Call the video processor utility with the script
        const result = await processScriptToVideo(script);
        setScenes(result.scenes);
        setVideoUri(result.videoUri);
      } catch (err) {
        console.error("Error processing script to video:", err);
        setError("Failed to generate video. Please check your script and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    generateVideo();
  }, [script]); // Re-run this effect whenever the 'script' prop changes

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating your video from script...</Text>
        <Text style={styles.loadingSubText}>This might take a moment as AI processes your story.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.videoPlayerWrapper}>
        {/* Pass the generated videoUri to the VideoPreview component */}
        <VideoPreview videoUri={videoUri} />
      </View>

      {/* Optionally display the generated scenes below the video */}
      {scenes.length > 0 && (
        <View style={styles.scenesListContainer}>
          <Text style={styles.scenesListTitle}>Script Breakdown:</Text>
          {scenes.map((scene, index) => (
            <Text key={scene.id || index} style={styles.sceneItem}>
              <Text style={styles.sceneItemBold}>Scene {index + 1}:</Text> {scene.description} ({scene.duration}s)
            </Text>
          ))}
        </View>
      )}

      {/* Add a placeholder for other controls/options */}
      <View style={styles.controlsPlaceholder}>
        <Text style={styles.controlsText}>Video controls and export options will go here.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    paddingVertical: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d9534f',
    textAlign: 'center',
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  videoPlayerWrapper: {
    width: '100%',
    aspectRatio: 16 / 9, // Common video aspect ratio
    backgroundColor: '#000',
    marginBottom: 20,
  },
  scenesListContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scenesListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sceneItem: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
    color: '#555',
  },
  sceneItemBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  controlsPlaceholder: {
    width: '90%',
    padding: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  controlsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default VideoPreviewScreen;
