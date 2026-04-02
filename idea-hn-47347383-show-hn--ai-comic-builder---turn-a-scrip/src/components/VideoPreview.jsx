import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const VideoPreview = ({ videoUri }) => {
  if (!videoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.noVideoText}>No video available. Generate a script first!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUri }}
        style={styles.videoPlayer}
        useNativeControls // Allows users to play, pause, seek, etc.
        resizeMode="contain" // Ensures the whole video is visible, letterboxing if necessary
        isLooping // Plays the video in a loop
        shouldPlay // Starts playing automatically when component mounts
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', // Take full width of parent
    backgroundColor: '#000', // Dark background for video player
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 300, // Fixed height for the video player, adjust as needed
    backgroundColor: 'black', // Background for the video area itself
  },
  noVideoText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default VideoPreview;
