import React, { useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, View } from 'react-native';
import { Text, FAB, Snackbar } from 'react-native-paper';
import { useAppStore } from '../../store/app-store';
import InventoryCard from '../../components/InventoryCard';
import { Listing } from '../../types';

export default function InventoryScreen() {
  const { listings, isSyncing, triggerSync, deleteListing } = useAppStore();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleRefresh = async () => {
    await triggerSync();
    setSnackbarMessage('Inventory synced successfully');
    setSnackbarVisible(true);
  };

  const handleEdit = (listing: Listing) => {
    setSnackbarMessage(`Edit functionality coming soon for: ${listing.title}`);
    setSnackbarVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteListing(id);
    setSnackbarMessage('Listing deleted');
    setSnackbarVisible(true);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No listings yet</Text>
      <Text style={styles.emptySubtext}>Tap the + button to create your first listing</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InventoryCard listing={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={listings.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isSyncing} onRefresh={handleRefresh} />
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setSnackbarMessage('Create listing screen coming soon');
          setSnackbarVisible(true);
        }}
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingVertical: 8,
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
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
