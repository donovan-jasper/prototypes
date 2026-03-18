import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { Item } from '../lib/db/schema';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
  onDelete: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress, onDelete }) => {
  const theme = useTheme();

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.colors.surfaceVariant }]}>
            {item.favicon_url ? (
              <Image source={{ uri: item.favicon_url }} style={styles.favicon} />
            ) : (
              <Text variant="headlineMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                🔗
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.content}>
          <Text variant="titleSmall" numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {getDomain(item.url)}
          </Text>
        </View>

        <IconButton
          icon="delete"
          size={18}
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favicon: {
    width: 32,
    height: 32,
  },
  content: {
    padding: 12,
  },
  title: {
    marginBottom: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
