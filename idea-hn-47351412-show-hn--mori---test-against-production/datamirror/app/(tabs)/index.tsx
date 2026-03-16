import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Portal, Provider as PaperProvider } from 'react-native-paper';
import { useSnapshots } from '../../lib/store/snapshots';
import SnapshotCard from '../../components/SnapshotCard';

export default function SnapshotsScreen() {
  const { snapshots, loadSnapshots } = useSnapshots();

  useEffect(() => {
    loadSnapshots();
  }, []);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <FlatList
          data={snapshots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SnapshotCard snapshot={item} />}
        />
        <Portal>
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => console.log('Create new snapshot')}
          />
        </Portal>
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
});
