import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { ActivityIndicator, Text, IconButton } from 'react-native-paper';

interface VideoPlayerProps {
  streamUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamUrl }) => {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleReadyForDisplay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load stream. Please try again later.');
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!status.isPlaying);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // In a real app, you would implement actual fullscreen mode
    // This is just a placeholder for the UI
  };

  return (
    <View style={styles.container}>
      <Video
        testID="video-player"
        ref={videoRef}
        source={{ uri: streamUrl }}
        style={isFullscreen ? styles.fullscreenVideo : styles.video}
        useNativeControls={false}
        resizeMode="contain"
        onLoadStart={handleLoadStart}
        onReadyForDisplay={handleReadyForDisplay}
        onError={handleError}
        shouldPlay={true}
      />

      {isLoading && (
        <View testID="loading-indicator" style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!isLoading && !error && (
        <View style={styles.controlsOverlay}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
            <IconButton
              icon={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
            <IconButton
              icon="fullscreen"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 1,
    textAlign: 'center',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    marginHorizontal: 16,
  },
});

export default VideoPlayer;
