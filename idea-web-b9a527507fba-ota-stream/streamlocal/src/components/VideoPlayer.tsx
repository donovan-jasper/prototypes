import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { ActivityIndicator, Text } from 'react-native-paper';

interface VideoPlayerProps {
  streamUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamUrl }) => {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Video
        ref={videoRef}
        source={{ uri: streamUrl }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        onLoadStart={handleLoadStart}
        onReadyForDisplay={handleReadyForDisplay}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingIndicator: {
    position: 'absolute',
    zIndex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    position: 'absolute',
    zIndex: 1,
  },
});

export default VideoPlayer;
