import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Share, Alert } from 'react-native';
import { FAB, Text, useTheme, Portal, Dialog, Button, TextInput, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useItems } from '../../hooks/useItems';
import { useShelves } from '../../hooks/useShelves';
import { ItemCard } from '../../components/ItemCard';
import { useUserStore } from '../../lib/store/user';
import { generateShareLink } from '../../lib/utils/share';
import { usePremium } from '../../hooks/usePremium';

export default function ShelfDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const shelfId = parseInt(id, 10);

  const { shelves } = useShelves();
  const { items, loading, createItem, removeItem, refresh } = useItems(shelfId);
  const { isPremium } = useUserStore();
  const { checkItemLimit } = usePremium();

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const shelf = shelves.find(s => s.id === shelfId);

  const handleAddItem = useCallback(() => {
    setUrl('');
    setAddDialogVisible(true);
  }, []);

  const extractMetadata = useCallback(async (itemUrl: string) => {
    try {
      const urlObj = new URL(itemUrl);
      const domain = urlObj.hostname.replace('www.', '');

      return {
        title: domain,
        description: itemUrl,
        image_url: undefined,
        favicon_url: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
    } catch {
      return {
        title: itemUrl,
        description: undefined,
        image_url: undefined,
        favicon_url: undefined,
      };
    }
  }, []);

  const handleSaveItem = useCallback(async () => {
    if (!url.trim()) return;

    const canAdd = await checkItemLimit(shelfId);
    if (!canAdd) {
      setAddDialogVisible(false);
      setPaywallVisible(true);
      return;
    }

    setSaving(true);
    try {
      const metadata = await extractMetadata(url.trim());
      await createItem(url.trim(), metadata);
      setUrl('');
      setAddDialogVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [url, shelfId, createItem, extractMetadata, checkItemLimit]);

  const handleDeleteItem = useCallback((itemId: number) => {
    setItemToDelete(itemId);
    setDeleteDialogVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (itemToDelete !== null) {
      await removeItem(itemToDelete);
      setItemToDelete(null);
      setDeleteDialogVisible(false);
    }
  }, [itemToDelete, removeItem]);

  const handleShareShelf = useCallback(async () => {
    if (!shelf) return;

    try {
      const shareLink = generateShareLink(shelf.id);
      await Share.share({
        message: `Check out my shelf "${shelf.name}" on ShelfLife: ${shareLink}`,
        url: shareLink,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share shelf');
    }
  }, [shelf]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text variant="displaySmall" style={{ marginBottom: 16 }}>🔗</Text>
      <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
        No items yet
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
        Add your first link to this shelf
      </Text>
    </View>
  ), [theme.colors.onSurfaceVariant]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text variant="headlineMedium" style={styles.shelfName}>
          {shelf?.name || 'Shelf'}
        </Text>
        <IconButton
          icon="share-variant"
          size={24}
          onPress={handleShareShelf}
          style={styles.shareButton}
        />
      </View>
      {shelf?.description && (
        <Text variant="bodyMedium" style={[styles.shelfDescription, { color: theme.colors.onSurfaceVariant }]}>
          {shelf.description}
        </Text>
      )}
      <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 8 }}>
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </Text>
    </View>
  ), [shelf, items.length, theme.colors.onSurfaceVariant, theme.colors.primary, handleShareShelf]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push(`/item/${item.id}`)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        )}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddItem}
      />

      <Portal>
        <Dialog visible={addDialogVisible} onDismiss={() => setAddDialogVisible(false)}>
          <Dialog.Title>Add Item</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="URL"
              value={url}
              onChangeText={setUrl}
              mode="outlined"
              placeholder="https://example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.urlInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleSaveItem}
              loading={saving}
              disabled={!url.trim()}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Item</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this item?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={paywallVisible} onDismiss={() => setPaywallVisible(false)}>
          <Dialog.Title>Premium Feature</Dialog.Title>
          <Dialog.Content>
            <Text>You've reached the free tier limit of 50 items per shelf.</Text>
            <Text style={{ marginTop: 8 }}>Upgrade to add more items.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPaywallVisible(false)}>Later</Button>
            <Button onPress={() => {
              setPaywallVisible(false);
              router.push('/paywall');
            }}>Upgrade</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shelfName: {
    fontWeight: 'bold',
    flex: 1,
  },
  shareButton: {
    margin: 0,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  urlInput: {
    marginTop: 8,
  },
});
