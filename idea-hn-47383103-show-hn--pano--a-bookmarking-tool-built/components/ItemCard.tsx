import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, IconButton, Avatar } from 'react-native-paper';

interface ItemCardProps {
  item: {
    id: number;
    url: string;
    title: string;
    description?: string;
    image_url?: string;
    favicon_url?: string;
  };
  onPress?: () => void;
  onDelete?: () => void;
  onOpenInBrowser?: () => void;
  showActions?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onDelete,
  onOpenInBrowser,
  showActions = true,
}) => {
  const theme = useTheme();

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const domain = getDomain(item.url);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholderImage, { backgroundColor: theme.colors.surfaceVariant }]}>
          {item.favicon_url ? (
            <Image
              source={{ uri: item.favicon_url }}
              style={styles.favicon}
              resizeMode="contain"
            />
          ) : (
            <Avatar.Icon
              icon="link-variant"
              size={40}
              style={{ backgroundColor: theme.colors.surfaceVariant }}
              color={theme.colors.onSurfaceVariant}
            />
          )}
        </View>
      )}

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

        <View style={styles.footer}>
          <View style={styles.domainContainer}>
            {item.favicon_url && !item.image_url && (
              <Image
                source={{ uri: item.favicon_url }}
                style={styles.smallFavicon}
                resizeMode="contain"
              />
            )}
            <Text
              variant="labelSmall"
              style={[styles.domain, { color: theme.colors.onSurfaceVariant }]}
            >
              {domain}
            </Text>
          </View>

          {showActions && (
            <View style={styles.actions}>
              {onOpenInBrowser && (
                <IconButton
                  icon="open-in-new"
                  size={20}
                  onPress={(e) => {
                    e.stopPropagation();
                    onOpenInBrowser();
                  }}
                  style={styles.actionButton}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  style={styles.actionButton}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favicon: {
    width: 40,
    height: 40,
  },
  content: {
    padding: 16,
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
  domainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallFavicon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  domain: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 4,
  },
});
