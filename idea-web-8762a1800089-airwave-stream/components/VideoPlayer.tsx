import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useStreamUrl } from '../hooks/useStreamUrl';
import { isRemoteStreamingEnabled } from '../lib/streaming';
import { useNavigation } from '@react-navigation/native';

interface Props {
  channelNumber: string;
  isLocal: boolean;
}

export default function VideoPlayer({ channelNumber, isLocal }: Props) {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const streamUrl = useStreamUrl(channelNumber);
  const navigation = useNavigation();

  useEffect(() => {
    const checkRemoteAccess = async () => {
      if (!isLocal) {
        const enabled = await isRemoteStreamingEnabled();
        if (!enabled) {
          setError('Remote streaming requires a premium subscription');
        }
      }
    };
    checkRemoteAccess();
  }, [isLocal]);

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

  if (!streamUrl) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading stream...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={toggleControls}
    >
      <Video
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
        </View>
      )}
    </TouchableOpacity>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height * 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
