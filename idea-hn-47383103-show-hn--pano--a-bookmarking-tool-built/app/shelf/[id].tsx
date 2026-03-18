import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Text, useTheme, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useItems } from '../../hooks/useItems';
import { useShelves } from '../../hooks/useShelves';
import { ItemCard } from '../../components/ItemCard';
import { useUserStore } from '../../lib/store/user';

export default function ShelfDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const shelfId = parseInt(id, 10);
  
  const { shelves } = useShelves();
  const { items, loading, createItem, removeItem, refresh } = useItems(shelfId);
  const { isPremium } = useUserStore();
  
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const shelf = shelves.find(s => s.id === shelfId);

  const handleAddItem = () => {
    setUrl('');
    setAddDialogVisible(true);
  };

  const extractMetadata = async (itemUrl: string) => {
    // Simple metadata extraction - in production, this would call an API
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
  };

  const handleSaveItem = async () => {
    if (!url.trim()) return;

    setSaving(true);
    try {
      const metadata = await extractMetadata(url.trim());
      await createItem(url.trim(), metadata);
      setUrl('');
      setAddDialogVisible(false);
    } catch (err) {
      if (err instanceof Error && err.message === 'FREE_TIER_LIMIT') {
        setAddDialogVisible(false);
        setPaywallVisible(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = (itemId: number) => {
    setItemToDelete(itemId);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete !== null) {
      await removeItem(itemToDelete);
      setItemToDelete(null);
      setDeleteDialogVisible(false);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="displaySmall" style={{ marginBottom: 16 }}>🔗</Text>
      <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
        No items yet
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
        Add your first link to this shelf
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
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddDialogVisible(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onPress={handleSaveItem} disabled={!url.trim() || saving} loading={saving}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={paywallVisible} onDismiss={() => setPaywallVisible(false)}>
          <Dialog.Title>Upgrade to Premium</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You've reached the free tier limit of 50 items per shelf. Upgrade to Premium for unlimited items!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPaywallVisible(false)}>Cancel</Button>
            <Button onPress={() => {
              setPaywallVisible(false);
              router.push('/paywall');
            }}>
              Upgrade
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Item</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this item?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>
              Delete
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  shelfName: {
    marginBottom: 4,
  },
  shelfDescription: {
    marginTop: 4,
  },
  list: {
    padding: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
