import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Avatar, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { Item } from '../lib/db/schema';

interface ItemCardProps {
  item: Item;
  onPress?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ItemCard({ item, onPress, showActions = true, onEdit, onDelete }: ItemCardProps) {
  const theme = useTheme();

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            {item.favicon_url ? (
              <Image
                source={{ uri: item.favicon_url }}
                style={styles.favicon}
                contentFit="contain"
              />
            ) : (
              <Avatar.Icon
                icon="link-variant"
                size={24}
                style={{ backgroundColor: 'transparent' }}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          </View>
        )}

        <View style={styles.content}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>

          {item.description && (
            <Text variant="bodySmall" numberOfLines={2} style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {item.description}
            </Text>
          )}

          <View style={styles.footer}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {getDomain(item.url)}
            </Text>

            {showActions && (
              <View style={styles.actions}>
                {onEdit && (
                  <IconButton
                    icon="pencil"
                    size={16}
                    onPress={onEdit}
                    style={styles.actionButton}
                  />
                )}
                {onDelete && (
                  <IconButton
                    icon="delete"
                    size={16}
                    onPress={onDelete}
                    style={styles.actionButton}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 1,
  },
  image: {
    width: 100,
    height: 100,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favicon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
  },
});
