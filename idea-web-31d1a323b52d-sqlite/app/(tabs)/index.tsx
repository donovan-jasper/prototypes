import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import DatabaseCard from '../../components/DatabaseCard';
import { listDatabases } from '../../lib/database';
import { useStore } from '../../lib/store';

export default function HomeScreen() {
  const { databases, setDatabases } = useStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDatabases = async () => {
      const dbs = await listDatabases();
      setDatabases(dbs);
      setLoading(false);
    };
    fetchDatabases();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={databases}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <DatabaseCard database={item} />}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push('/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
