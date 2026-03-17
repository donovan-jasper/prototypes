import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import DatabaseCard from '@/components/DatabaseCard';
import { useDatabaseStore } from '@/store/database-store';

const HomeScreen = () => {
  const router = useRouter();
  const { databases, fetchDatabases } = useDatabaseStore();

  useEffect(() => {
    fetchDatabases();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={databases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DatabaseCard
            database={item}
            onPress={() => router.push(`/database/${item.id}`)}
          />
        )}
        onRefresh={fetchDatabases}
        refreshing={false}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push('/database/add')}
      />
    </View>
  );
};

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

export default HomeScreen;
