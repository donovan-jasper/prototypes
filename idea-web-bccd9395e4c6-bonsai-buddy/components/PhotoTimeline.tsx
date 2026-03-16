import React from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function PhotoTimeline({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No photos yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Photo Timeline
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {photos.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.photo} />
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
  photo: {
    width: 150,
    height: 150,
    marginRight: 8,
    borderRadius: 8,
  },
});
