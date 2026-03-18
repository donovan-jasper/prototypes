import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface DeckCardProps {
  title: string;
  slideCount: number;
  createdAt: number;
  thumbnail?: string;
}

export default function DeckCard({ title, slideCount, createdAt, thumbnail }: DeckCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <Card style={styles.card} mode="elevated">
      <View style={styles.thumbnailContainer}>
        {thumbnail ? (
          <Card.Cover source={{ uri: thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Text variant="displaySmall" style={styles.placeholderIcon}>
              📊
            </Text>
          </View>
        )}
      </View>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.metadata}>
          <Text variant="bodySmall" style={styles.metadataText}>
            {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
          </Text>
          <Text variant="bodySmall" style={styles.metadataText}>
            •
          </Text>
          <Text variant="bodySmall" style={styles.metadataText}>
            {formatDate(createdAt)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    width: CARD_WIDTH,
    backgroundColor: '#fff',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    color: '#666',
  },
});
