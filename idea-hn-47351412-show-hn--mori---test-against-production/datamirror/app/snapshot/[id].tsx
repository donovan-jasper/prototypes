import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Text, Button } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { loadSnapshot } from '../../lib/database/snapshot';
import SchemaViewer from '../../components/SchemaViewer';

export default function SnapshotDetailScreen() {
  const { id } = useLocalSearchParams();
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const fetchSnapshot = async () => {
      const data = await loadSnapshot(id);
      setSnapshot(data);
    };
    fetchSnapshot();
  }, [id]);

  if (!snapshot) {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium">{snapshot.name}</Text>
        <Text>Source: {snapshot.source_connection}</Text>
        <Text>Rows: {snapshot.row_count}</Text>
        <Text>Created: {new Date(snapshot.created_at).toLocaleString()}</Text>
        <SchemaViewer schema={snapshot.schema} />
        <Button mode="contained" onPress={() => console.log('Sync snapshot')}>
          Sync
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
