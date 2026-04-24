import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { Text, useTheme, Button, Appbar, IconButton, Card, Avatar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useItems } from '../../hooks/useItems';
import { useShelves } from '../../hooks/useShelves';
import { ItemCard } from '../../components/ItemCard';
import { parseShareLink, cloneShelf } from '../../lib/utils/share';
import { useUserStore } from '../../lib/store/user';
import { trackShelfView } from '../../lib/utils/share';

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
      await cloneShelf(shelfId, user.id);
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

  const renderItem = ({ item }: { item: any }) => (
    <ItemCard
      item={item}
      onPress={() => handleOpenInBrowser(item.url)}
      showActions={false}
    />
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Shared Shelf" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderHeader()}

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />

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

          <Button
            mode="outlined"
            onPress={() => router.push('/')}
            icon="home"
          >
            Go to Home
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  cloneButton: {
    marginBottom: 8,
  },
});
