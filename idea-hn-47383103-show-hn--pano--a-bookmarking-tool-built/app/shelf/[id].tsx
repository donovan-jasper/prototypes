import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Share, Alert, Linking } from 'react-native';
import { FAB, Text, useTheme, Portal, Dialog, Button, TextInput, IconButton, Appbar } from 'react-native-paper';
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

  const { shelves, updateShelf } = useShelves();
  const { items, loading, createItem, removeItem, refresh } = useItems(shelfId);
  const { isPremium } = useUserStore();
  const { checkItemLimit } = usePremium();

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [editShelfDialogVisible, setEditShelfDialogVisible] = useState(false);
  const [shelfName, setShelfName] = useState('');
  const [shelfDescription, setShelfDescription] = useState('');

  const shelf = shelves.find(s => s.id === shelfId);

  useEffect(() => {
    if (shelf) {
      setShelfName(shelf.name);
      setShelfDescription(shelf.description || '');
    }
  }, [shelf]);

  const handleAddItem = useCallback(() => {
    setUrl('');
    setAddDialogVisible(true);
  }, []);

  const extractMetadata = useCallback(async (itemUrl: string) => {
    try {
      const urlObj = new URL(itemUrl);
      const domain = urlObj.hostname.replace('www.', '');

      // In a real app, this would call an API to fetch metadata
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

  const handleEditShelf = useCallback(() => {
    if (shelf) {
      setShelfName(shelf.name);
      setShelfDescription(shelf.description || '');
      setEditShelfDialogVisible(true);
    }
  }, [shelf]);

  const handleSaveShelfChanges = useCallback(async () => {
    if (shelf && shelfName.trim()) {
      await updateShelf(shelf.id, {
        name: shelfName.trim(),
        description: shelfDescription.trim()
      });
      setEditShelfDialogVisible(false);
    }
  }, [shelf, shelfName, shelfDescription, updateShelf]);

  const handleOpenInBrowser = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Failed to open URL');
    });
  }, []);

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
      <View style={styles.headerContent}>
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
      <View style={styles.headerActions}>
        <IconButton
          icon="pencil"
          size={20}
          onPress={handleEditShelf}
          style={styles.actionButton}
        />
        <IconButton
          icon="share-variant"
          size={20}
          onPress={handleShareShelf}
          style={styles.actionButton}
        />
      </View>
    </View>
  ), [shelf, items.length, theme.colors.onSurfaceVariant, handleEditShelf, handleShareShelf]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <ItemCard
      item={item}
      onPress={() => router.push(`/item/${item.id}`)}
      onDelete={() => handleDeleteItem(item.id)}
      onOpenInBrowser={() => handleOpenInBrowser(item.url)}
    />
  ), [router, handleDeleteItem, handleOpenInBrowser]);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={shelf?.name || 'Shelf'} />
      </Appbar.Header>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddItem}
        color={theme.colors.onPrimary}
      />

      <Portal>
        <Dialog visible={addDialogVisible} onDismiss={() => setAddDialogVisible(false)}>
          <Dialog.Title>Add New Item</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="URL"
              value={url}
              onChangeText={setUrl}
              autoFocus
              mode="outlined"
              style={{ marginBottom: 16 }}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleSaveItem}
              loading={saving}
              disabled={!url.trim()}
              mode="contained"
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
            <Button onPress={confirmDelete} mode="contained" textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={editShelfDialogVisible} onDismiss={() => setEditShelfDialogVisible(false)}>
          <Dialog.Title>Edit Shelf</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Shelf Name"
              value={shelfName}
              onChangeText={setShelfName}
              mode="outlined"
              style={{ marginBottom: 16 }}
              autoFocus
            />
            <TextInput
              label="Description"
              value={shelfDescription}
              onChangeText={setShelfDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditShelfDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleSaveShelfChanges}
              mode="contained"
              disabled={!shelfName.trim()}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={paywallVisible} onDismiss={() => setPaywallVisible(false)}>
          <Dialog.Title>Premium Feature</Dialog.Title>
          <Dialog.Content>
            <Text>You've reached the free tier limit of 50 items per shelf.</Text>
            <Text style={{ marginTop: 16 }}>Upgrade to add more items.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPaywallVisible(false)}>Maybe Later</Button>
            <Button
              onPress={() => {
                setPaywallVisible(false);
                router.push('/paywall');
              }}
              mode="contained"
            >
              Upgrade
            </Button>
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
  listContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
  },
  shelfName: {
    marginBottom: 4,
  },
  shelfDescription: {
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
