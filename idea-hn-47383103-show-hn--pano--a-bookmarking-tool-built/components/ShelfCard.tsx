import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { Shelf } from '../lib/db/schema';

interface ShelfCardProps {
  shelf: Shelf & { item_count: number };
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ShelfCard: React.FC<ShelfCardProps> = ({ shelf, onPress, onEdit, onDelete }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {shelf.cover_image ? (
          <Image source={{ uri: shelf.cover_image }} style={styles.coverImage} />
        ) : (
          <View style={[styles.placeholderCover, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="displaySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              📚
            </Text>
          </View>
        )}
        
        <View style={styles.content}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
            {shelf.name}
          </Text>
          
          {shelf.description && (
            <Text variant="bodySmall" numberOfLines={2} style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {shelf.description}
            </Text>
          )}
          
          <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
            {shelf.item_count} {shelf.item_count === 1 ? 'item' : 'items'}
          </Text>
        </View>

        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          />
        </View>
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
  },
  coverImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
});
