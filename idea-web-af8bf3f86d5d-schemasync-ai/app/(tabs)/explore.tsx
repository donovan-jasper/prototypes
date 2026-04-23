import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SchemaTree from '@/components/SchemaTree';
import OfflineIndicator from '@/components/OfflineIndicator';
import { useDatabaseStore } from '@/store/database-store';
import { useNetworkStore } from '@/store/network-store';

export default function ExploreScreen() {
  const { databaseId } = useLocalSearchParams<{ databaseId: string }>();
  const { loadSchema, databases } = useDatabaseStore();
  const { isOnline } = useNetworkStore();

  const database = databases.find(db => db.id === databaseId);

  useEffect(() => {
    if (databaseId) {
      loadSchema(databaseId);
    }
  }, [databaseId]);

  const handleTablePress = (tableName: string) => {
    // Navigate to table details or show AI explanation
    console.log('Table pressed:', tableName);
  };

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      {databaseId && (
        <SchemaTree
          databaseId={databaseId}
          onTablePress={handleTablePress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
