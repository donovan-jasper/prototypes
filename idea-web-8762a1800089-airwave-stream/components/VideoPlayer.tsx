import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useStreamUrl } from '../hooks/useStreamUrl';
import { useNavigation } from '@react-navigation/native';
import PiPController from './PiPController';

interface Props {
  channelNumber: string;
  isLocal: boolean;
}

export default function VideoPlayer({ channelNumber, isLocal }: Props) {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const { streamUrl, isConnecting, connectionError, showPaywall } = useStreamUrl(channelNumber);
  const navigation = useNavigation();
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (connectionError) {
      setError(connectionError);
    }
  }, [connectionError]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status.isLoaded) {
      if (status.isBuffering) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    } else if (status.error) {
      setIsLoading(false);
      setError(`Playback error: ${status.error}`);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const togglePiPMode = async () => {
    if (isPiPActive) {
      await exitPiPMode();
    } else {
      await enterPiPMode();
    }
  };

  const enterPiPMode = async () => {
    if (videoRef.current) {
      try {
        if (Platform.OS === 'ios') {
          await videoRef.current.presentPictureInPictureAsync();
          setIsPiPActive(true);
        } else if (Platform.OS === 'android') {
          // For Android, we would use react-native-pip-android
          // This is a simplified version
          setIsPiPActive(true);
        }
      } catch (error) {
        console.error('Failed to enter PiP mode:', error);
        Alert.alert('Error', 'Could not enter Picture-in-Picture mode');
      }
    }
  };

  const exitPiPMode = async () => {
    if (videoRef.current) {
      try {
        if (Platform.OS === 'ios') {
          await videoRef.current.stopPictureInPictureAsync();
        }
        setIsPiPActive(false);
      } catch (error) {
        console.error('Failed to exit PiP mode:', error);
      }
    }
  };

  if (showPaywall) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Remote streaming requires a premium subscription</Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('settings')}
        >
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        {!isLocal && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('settings')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Establishing remote connection...</Text>
      </View>
    );
  }

  if (!streamUrl) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading stream...</Text>
      </View>
    );
  }

  if (isPiPActive) {
    return <PiPController channelNumber={channelNumber} />;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={toggleControls}
    >
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: streamUrl }}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Buffering...</Text>
        </View>
      )}

      {showControls && (
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => status?.isPlaying ? status?.pauseAsync() : status?.playAsync()}
          >
            <Text style={styles.controlButtonText}>
              {status?.isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pipButton}
            onPress={togglePiPMode}
          >
            <Text style={styles.controlButtonText}>
              {isPiPActive ? 'Exit PiP' : 'Enter PiP'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
  },
  pipButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
  },
  controlButtonText: {
    color: 'white',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    margin: 20,
  },
  upgradeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
