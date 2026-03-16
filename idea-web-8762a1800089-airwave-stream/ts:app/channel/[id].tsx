import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import VideoPlayer from '../../components/VideoPlayer';
import { useStreamUrl } from '../../hooks/useStreamUrl';

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const streamUrl = useStreamUrl(id);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <VideoPlayer streamUrl={streamUrl} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
