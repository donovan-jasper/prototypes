import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDatabase } from '../../hooks/useDatabase';
import { ShelfQueries, ItemQueries } from '../../lib/db/queries';
import { Shelf, Item } from '../../lib/db/schema';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { trackShelfView } from '../../lib/utils/share';

export default function ShareShelfScreen() {
  const { shelfId } = useLocalSearchParams<{ shelfId: string }>();
  const { db } = useDatabase();
  const theme = useTheme();

  const [shelf, setShelf] = useState<(Shelf & { item_count: number }) | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number>(0);

  useEffect(() => {
    async function loadShelf() {
      if (!db || !shelfId) return;

      try {
        setLoading(true);
        const shelfQueries = new ShelfQueries(db);
        const itemQueries = new ItemQueries(db);

        // Get shelf data
        const shelfData = await shelfQueries.getShelf(parseInt(shelfId));
        if (!shelfData) {
          setError('Shelf not found');
          return;
        }

        // Get items
        const itemsData = await itemQueries.getItemsForShare(parseInt(shelfId));

        // Track view
        const newViewCount = await trackShelfView(parseInt(shelfId));

        setShelf(shelfData);
        setItems(itemsData);
        setViewCount(newViewCount);
      } catch (err) {
        console.error('Error loading shelf:', err);
        setError('Failed to load shelf');
      } finally {
        setLoading(false);
      }
    }

    loadShelf();
  }, [db, shelfId]);

  const handleClone = async () => {
    // In a real app, this would require authentication
    // For now, we'll just show a message
    alert('Clone functionality would be implemented here');
  };

  const handleOpenInApp = async () => {
    // In a real app, this would open the app with the shelf
    // For now, we'll just show a message
    alert('Open in app functionality would be implemented here');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  if (!shelf) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Shelf not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {shelf.cover_image && (
          <Image
            source={{ uri: shelf.cover_image }}
            style={styles.coverImage}
            contentFit="cover"
          />
        )}
        <View style={styles.headerContent}>
          <Text style={[styles.shelfName, { color: theme.colors.onBackground }]}>{shelf.name}</Text>
          {shelf.description && (
            <Text style={[styles.shelfDescription, { color: theme.colors.onBackground }]}>
              {shelf.description}
            </Text>
          )}
          <Text style={[styles.viewCount, { color: theme.colors.onBackground }]}>
            {viewCount} {viewCount === 1 ? 'view' : 'views'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleClone}
        >
          <MaterialIcons name="file-copy" size={20} color={theme.colors.onPrimary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>Clone to My Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={handleOpenInApp}
        >
          <MaterialIcons name="open-in-new" size={20} color={theme.colors.onSecondary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>Open in App</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => Linking.openURL(item.url)}
          >
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.itemImage}
                contentFit="cover"
              />
            )}
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={[styles.itemDescription, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <View style={styles.itemFooter}>
                {item.favicon_url && (
                  <Image
                    source={{ uri: item.favicon_url }}
                    style={styles.favicon}
                    contentFit="contain"
                  />
                )}
                <Text style={[styles.itemUrl, { color: theme.colors.onSurface }]} numberOfLines={1}>
                  {new URL(item.url).hostname}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  shelfName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shelfDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  viewCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favicon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  itemUrl: {
    fontSize: 12,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
