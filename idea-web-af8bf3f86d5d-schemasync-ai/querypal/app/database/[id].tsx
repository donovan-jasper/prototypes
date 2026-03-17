import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabaseStore } from '@/store/database-store';

const DatabaseDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { databases, removeDatabase } = useDatabaseStore();
  const database = databases.find(db => db.id === id);

  useEffect(() => {
    if (!database) {
      router.back();
    }
  }, [database]);

  if (!database) {
    return null;
  }

  const handleDelete = () => {
    removeDatabase(database.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{database.name}</Text>
      <Text>Type: {database.type}</Text>
      <Text>Last Sync: {database.lastSync.toLocaleString()}</Text>
      <Button mode="contained" onPress={() => router.push('/explore')}>
        View Schema
      </Button>
      <Button mode="outlined" onPress={handleDelete} style={styles.deleteButton}>
        Delete Database
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  deleteButton: {
    marginTop: 16,
  },
});

export default DatabaseDetailScreen;
