import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import VideoPlayer from '../../components/VideoPlayer';
import { useStreamUrl } from '../../hooks/useStreamUrl';

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLocal } = useStreamUrl(id);

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoPlayer
        channelNumber={id}
        isLocal={isLocal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
