import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface Props {
  streamUrl: string;
}

export default function VideoPlayer({ streamUrl }: Props) {
  if (!streamUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No stream available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Demo Mode - Using test stream</Text>
      </View>
      <Video
        style={styles.video}
        source={{ uri: streamUrl }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
      />
    </View>
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
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  banner: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 10,
    alignItems: 'center',
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
