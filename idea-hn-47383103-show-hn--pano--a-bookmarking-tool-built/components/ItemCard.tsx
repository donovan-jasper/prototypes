import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';

interface ItemCardProps {
  item: {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    favicon_url?: string;
    url: string;
  };
  onPress?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onDelete,
  readOnly = false,
}) => {
  const theme = useTheme();

  const renderImage = () => {
    if (item.image_url) {
      return (
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    if (item.favicon_url) {
      return (
        <View style={styles.faviconContainer}>
          <Image
            source={{ uri: item.favicon_url }}
            style={styles.favicon}
            resizeMode="contain"
          />
        </View>
      );
    }

    return (
      <View style={[styles.faviconContainer, styles.placeholderFavicon]}>
        <Text style={styles.placeholderText}>
          {item.title.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {renderImage()}
      </View>

      <View style={styles.content}>
        <Text
          variant="titleMedium"
          numberOfLines={2}
          style={styles.title}
        >
          {item.title}
        </Text>

        {item.description && (
          <Text
            variant="bodySmall"
            numberOfLines={2}
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.description}
          </Text>
        )}

        <Text
          variant="labelSmall"
          numberOfLines={1}
          style={[styles.url, { color: theme.colors.primary }]}
        >
          {new URL(item.url).hostname.replace('www.', '')}
        </Text>
      </View>

      {!readOnly && onDelete && (
        <IconButton
          icon="delete"
          size={20}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={styles.deleteButton}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  imageContainer: {
    height: 120,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  faviconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  favicon: {
    width: 48,
    height: 48,
  },
  placeholderFavicon: {
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  content: {
    padding: 12,
  },
  title: {
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    marginBottom: 4,
  },
  url: {
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    margin: 0,
  },
});
