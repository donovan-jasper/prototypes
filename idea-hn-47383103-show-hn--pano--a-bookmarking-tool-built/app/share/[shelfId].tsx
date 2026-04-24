import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Text, useTheme, Button, Appbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useItems } from '../../hooks/useItems';
import { useShelves } from '../../hooks/useShelves';
import { ItemCard } from '../../components/ItemCard';
import { parseShareLink } from '../../lib/utils/share';
import { useUserStore } from '../../lib/store/user';

export default function PublicShelfScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { shelfId: shelfIdParam, token } = useLocalSearchParams<{ shelfId: string; token: string }>();
  const shelfId = parseInt(shelfIdParam, 10);

  const { shelves, loading: shelvesLoading } = useShelves();
  const { items, loading: itemsLoading, refresh } = useItems(shelfId);
  const { user } = useUserStore();

  const [isCloning, setIsCloning] = useState(false);

  const shelf = shelves.find(s => s.id === shelfId);

  useEffect(() => {
    // Verify the share link is valid
    if (!parseShareLink(`https://shelflife.app/share/${shelfId}?token=${token}`)) {
      Alert.alert('Invalid Link', 'This share link is not valid.');
      router.back();
    }
  }, [shelfId, token, router]);

  const handleCloneShelf = async () => {
    if (!shelf || !user) {
      Alert.alert('Error', 'Unable to clone shelf at this time.');
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
    </View>
  );

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
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Shared Shelf" />
      </Appbar.Header>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push(`/item/${item.id}`)}
            readOnly
          />
        )}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
      />

      <View style={styles.cloneButtonContainer}>
        <Button
          mode="contained"
          onPress={handleCloneShelf}
          loading={isCloning}
          disabled={isCloning}
          style={styles.cloneButton}
        >
          Clone to My Library
        </Button>
      </View>
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
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  shelfName: {
    fontWeight: 'bold',
  },
  shelfDescription: {
    marginTop: 4,
  },
  list: {
    padding: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  cloneButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cloneButton: {
    marginTop: 8,
  },
});
