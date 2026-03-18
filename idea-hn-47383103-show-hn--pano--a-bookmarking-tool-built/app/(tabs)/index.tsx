import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Text, useTheme, Portal, Dialog, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useShelves } from '../../hooks/useShelves';
import { ShelfCard } from '../../components/ShelfCard';
import { AddShelfDialog } from '../../components/AddShelfDialog';
import { useUserStore } from '../../lib/store/user';

export default function ShelvesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { shelves, loading, createShelf, editShelf, removeShelf, refresh } = useShelves();
  const { isPremium } = useUserStore();
  
  const [dialogVisible, setDialogVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingShelf, setEditingShelf] = useState<{ id: number; name: string; description: string | null } | undefined>();
  const [shelfToDelete, setShelfToDelete] = useState<number | null>(null);

  const handleAddShelf = () => {
    setEditingShelf(undefined);
    setDialogVisible(true);
  };

  const handleEditShelf = (shelf: { id: number; name: string; description: string | null }) => {
    setEditingShelf(shelf);
    setDialogVisible(true);
  };

  const handleSaveShelf = async (name: string, description: string) => {
    try {
      if (editingShelf) {
        await editShelf(editingShelf.id, { name, description });
      } else {
        await createShelf(name, description);
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'FREE_TIER_LIMIT') {
        setPaywallVisible(true);
      }
      throw err;
    }
  };

  const handleDeleteShelf = (id: number) => {
    setShelfToDelete(id);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (shelfToDelete !== null) {
      await removeShelf(shelfToDelete);
      setShelfToDelete(null);
      setDeleteDialogVisible(false);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="displaySmall" style={{ marginBottom: 16 }}>📚</Text>
      <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
        No shelves yet
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
        Create your first shelf to start organizing your saved links
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={shelves}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <ShelfCard
            shelf={item}
            onPress={() => router.push(`/shelf/${item.id}`)}
            onEdit={() => handleEditShelf({ id: item.id, name: item.name, description: item.description })}
            onDelete={() => handleDeleteShelf(item.id)}
          />
        )}
        contentContainerStyle={shelves.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddShelf}
      />

      <AddShelfDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        onSave={handleSaveShelf}
        editShelf={editingShelf}
      />

      <Portal>
        <Dialog visible={paywallVisible} onDismiss={() => setPaywallVisible(false)}>
          <Dialog.Title>Upgrade to Premium</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You've reached the free tier limit of 3 shelves. Upgrade to Premium for unlimited shelves and more features!
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
          <Dialog.Title>Delete Shelf</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this shelf? All items in it will be permanently removed.
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
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
