import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMediaStore } from '../../store/mediaStore';
import ProgressInput from '../../components/ProgressInput';

const MediaDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { media, updateProgress } = useMediaStore();
  const mediaItem = media.find((item) => item.id === id);

  if (!mediaItem) {
    return (
      <View style={styles.container}>
        <Text>Media not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mediaItem.title}</Text>
      <Text style={styles.type}>{mediaItem.type}</Text>
      <ProgressInput
        currentProgress={mediaItem.currentProgress}
        totalProgress={mediaItem.totalProgress}
        unit={mediaItem.unit}
        onUpdate={(progress) => updateProgress(mediaItem.id, progress)}
      />
      <Text style={styles.lastUpdated}>
        Last updated: {mediaItem.lastUpdated.toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  type: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: 'gray',
    marginTop: 16,
  },
});

export default MediaDetailScreen;
