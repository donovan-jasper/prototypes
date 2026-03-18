import React from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface Photo {
  uri: string;
  timestamp: number;
}

const extractTimestampFromUri = (uri: string): number => {
  const match = uri.match(/_(\d+)\.jpg$/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return Date.now();
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default function PhotoTimeline({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.title}>
          Photo Timeline
        </Text>
        <Text style={styles.emptyText}>No photos yet</Text>
      </View>
    );
  }

  const photosWithTimestamps: Photo[] = photos.map(uri => ({
    uri,
    timestamp: extractTimestampFromUri(uri),
  }));

  photosWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Photo Timeline
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {photosWithTimestamps.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <Text variant="bodySmall" style={styles.dateText}>
              {formatDate(photo.timestamp)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  photoContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  dateText: {
    marginTop: 4,
    color: '#666',
  },
});
