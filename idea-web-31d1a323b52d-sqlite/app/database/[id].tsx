import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DatabaseCard from '../../components/DatabaseCard';
import { queryDatabase } from '../../lib/database';
import { useStore } from '../../lib/store';

export default function DatabaseScreen() {
  const { id } = useLocalSearchParams();
  const { databases } = useStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const database = databases.find((db) => db.name === id);

  useEffect(() => {
    const fetchRows = async () => {
      const data = await queryDatabase(id as string, 'SELECT * FROM ' + id);
      setRows(data);
      setLoading(false);
    };
    fetchRows();
  }, [id]);

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
        data={rows}
        keyExtractor={(item, index) => index.toString()}
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
