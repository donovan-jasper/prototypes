import React from 'react';
import { View, StyleSheet } from 'react-native';
import VideoPlayer from './VideoPlayer';

interface Props {
  streamUrl: string;
}

export default function PiPController({ streamUrl }: Props) {
  // This is a placeholder implementation
  // Actual PiP functionality would require platform-specific implementations
  return (
    <View style={styles.container}>
      <VideoPlayer streamUrl={streamUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
