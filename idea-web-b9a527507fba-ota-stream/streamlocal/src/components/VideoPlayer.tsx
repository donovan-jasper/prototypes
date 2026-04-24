import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { ActivityIndicator, Text, IconButton } from 'react-native-paper';
import * as ScreenOrientation from 'expo-screen-orientation';

interface VideoPlayerProps {
  streamUrl: string;
  channelName: string;
  currentProgram: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamUrl, channelName, currentProgram }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleReadyForDisplay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load stream. Please check your connection and try again.');
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePictureInPicture = async () => {
    if (videoRef.current && Platform.OS === 'android') {
      await videoRef.current.presentFullscreenPlayer();
    }
  };

  const handlePress = () => {
    setShowControls(!showControls);
    if (!showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={styles.videoContainer}
      >
        <Video
          testID="video-player"
          ref={videoRef}
          source={{ uri: streamUrl }}
          style={isFullscreen ? styles.fullscreenVideo : styles.video}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={setStatus}
          onLoadStart={handleLoadStart}
          onReadyForDisplay={handleReadyForDisplay}
          onError={handleError}
          shouldPlay={true}
        />

        {isLoading && (
          <View testID="loading-indicator" style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading {channelName}...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <IconButton
              icon="refresh"
              size={24}
              color="#fff"
              onPress={() => {
                setIsLoading(true);
                setError(null);
                if (videoRef.current) {
                  videoRef.current.replayAsync();
                }
              }}
            />
          </View>
        )}

        {!isLoading && !error && showControls && (
          <>
            <View style={styles.infoOverlay}>
              <Text style={styles.channelName}>{channelName}</Text>
              <Text style={styles.programTitle}>{currentProgram}</Text>
            </View>

            <View style={styles.controlsOverlay}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                <IconButton
                  icon={status.isPlaying ? 'pause' : 'play'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePictureInPicture} style={styles.controlButton}>
                <IconButton
                  icon="picture-in-picture-bottom-right"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
                <IconButton
                  icon={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  channelName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  programTitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
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
    zIndex: 2,
  },
  controlButton: {
    marginHorizontal: 16,
  },
});

export default VideoPlayer;
