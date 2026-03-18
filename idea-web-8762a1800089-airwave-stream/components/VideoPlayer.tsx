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
});
