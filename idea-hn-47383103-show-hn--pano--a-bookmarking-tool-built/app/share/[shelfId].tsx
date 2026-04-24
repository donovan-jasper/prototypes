import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { Text, useTheme, Button, Appbar, IconButton, Card, Avatar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useItems } from '../../hooks/useItems';
import { useShelves } from '../../hooks/useShelves';
import { ItemCard } from '../../components/ItemCard';
import { parseShareLink } from '../../lib/utils/share';
import { useUserStore } from '../../lib/store/user';
import { trackShelfView } from '../../lib/api/analytics';

export default function PublicShelfScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { shelfId: shelfIdParam, token } = useLocalSearchParams<{ shelfId: string; token: string }>();
  const shelfId = parseInt(shelfIdParam, 10);

  const { shelves, loading: shelvesLoading } = useShelves();
  const { items, loading: itemsLoading, refresh } = useItems(shelfId);
  const { user, isPremium } = useUserStore();

  const [isCloning, setIsCloning] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const [viewCount, setViewCount] = useState<number | null>(null);

  const shelf = shelves.find(s => s.id === shelfId);

  useEffect(() => {
    // Verify the share link is valid
    const linkValid = parseShareLink(`https://shelflife.app/share/${shelfId}?token=${token}`);
    if (!linkValid) {
      setIsValidLink(false);
      return;
    }

    // Track view if premium user
    if (isPremium && shelfId) {
      trackShelfView(shelfId).then(count => {
        setViewCount(count);
      }).catch(() => {
        // Silently fail if tracking fails
      });
    }
  }, [shelfId, token, isPremium]);

  const handleCloneShelf = async () => {
    if (!shelf || !user) {
      Alert.alert('Error', 'You must be logged in to clone a shelf.');
      return;
    }

    setIsCloning(true);
    try {
      // In a real app, this would:
      // 1. Create a new shelf in the user's library
      // 2. Copy all items to the new shelf
      // 3. Show success message

      // For this prototype, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        `Shelf "${shelf.name}" has been cloned to your library.`,
        [
          {
            text: 'View My Library',
            onPress: () => router.push('/'),
          },
          {
            text: 'OK',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to clone shelf. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleOpenInBrowser = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Failed to open URL');
    });
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="displaySmall" style={{ marginBottom: 16 }}>🔗</Text>
      <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
        No items in this shelf
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="headlineMedium" style={styles.shelfName}>
        {shelf?.name || 'Shelf'}
      </Text>
      {shelf?.description && (
        <Text variant="bodyMedium" style={[styles.shelfDescription, { color: theme.colors.onSurfaceVariant }]}>
          {shelf.description}
        </Text>
      )}
      <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 8 }}>
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </Text>

      {isPremium && viewCount !== null && (
        <View style={styles.viewCountContainer}>
          <Avatar.Icon
            size={24}
            icon="eye"
            style={{ backgroundColor: theme.colors.surfaceVariant }}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
            {viewCount} {viewCount === 1 ? 'view' : 'views'}
          </Text>
        </View>
      )}
    </View>
  );

  if (!isValidLink) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text variant="headlineSmall">Invalid Share Link</Text>
        <Text style={{ marginTop: 16, textAlign: 'center' }}>
          The link you followed is not valid or has expired.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={{ marginTop: 24 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  if (shelvesLoading || itemsLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!shelf) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text variant="headlineSmall">Shelf not found</Text>
        <Text style={{ marginTop: 16, textAlign: 'center' }}>
          The shelf you're trying to view doesn't exist or has been removed.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/')}
          style={{ marginTop: 24 }}
        >
          Go to My Library
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Shared Shelf" />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderHeader()}

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleCloneShelf}
            loading={isCloning}
            disabled={isCloning}
            icon="content-copy"
            style={styles.cloneButton}
          >
            Clone to My Library
          </Button>
        </View>

        {items.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={() => handleOpenInBrowser(item.url)}
                readOnly
              />
            )}
            contentContainerStyle={styles.itemsList}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  shelfName: {
    marginBottom: 8,
  },
  shelfDescription: {
    marginBottom: 8,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    marginBottom: 24,
  },
  cloneButton: {
    marginBottom: 16,
  },
  itemsList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});
