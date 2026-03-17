import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Portal, Provider as PaperProvider, ActivityIndicator, Text } from 'react-native-paper';
import { useSnapshots } from '../../lib/store/snapshots';
import SnapshotCard from '../../components/SnapshotCard';
import ConnectionForm from '../../components/ConnectionForm';
import { createSnapshot } from '../../lib/database/snapshot';

export default function SnapshotsScreen() {
  const { snapshots, loadSnapshots, addSnapshot } = useSnapshots();
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const handleCreateSnapshot = async (connection) => {
    setIsCreatingSnapshot(true);
    try {
      // Create snapshot with the provided connection details
      const snapshot = await createSnapshot(connection, { limit: 1000 });

      // Save the snapshot to Zustand store and local SQLite database
      await addSnapshot(snapshot);

      // Close the connection form
      setShowConnectionForm(false);
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      alert('Failed to create snapshot. Please check your connection details and try again.');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {snapshots.length === 0 && !isCreatingSnapshot ? (
          <View style={styles.emptyState}>
            <Text>No snapshots yet. Create your first one!</Text>
          </View>
        ) : (
          <FlatList
            data={snapshots}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SnapshotCard snapshot={item} />}
          />
        )}

        {isCreatingSnapshot && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
            <Text>Creating snapshot...</Text>
          </View>
        )}

        <Portal>
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setShowConnectionForm(true)}
            disabled={isCreatingSnapshot}
          />
        </Portal>

        <ConnectionForm
          visible={showConnectionForm}
          onDismiss={() => setShowConnectionForm(false)}
          onSubmit={handleCreateSnapshot}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
