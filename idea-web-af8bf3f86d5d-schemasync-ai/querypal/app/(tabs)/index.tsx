import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DatabaseCard from '@/components/DatabaseCard';
import { useDatabaseStore } from '@/store/database-store';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { databases, refreshDatabases } = useDatabaseStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={databases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DatabaseCard
            database={item}
            onPress={() => navigation.navigate('database/[id]', { id: item.id })}
          />
        )}
        onRefresh={refreshDatabases}
        refreshing={false}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('database/add')}
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
