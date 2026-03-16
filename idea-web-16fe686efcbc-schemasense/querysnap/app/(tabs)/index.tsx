import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import DatabaseCard from '../../components/DatabaseCard';
import { useDatabase } from '../../hooks/useDatabase';

const IndexScreen = () => {
  const { databases, addDatabase } = useDatabase();

  const handleImport = () => {
    // Implement import functionality
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={databases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DatabaseCard database={item} />}
        ListEmptyComponent={<Text>No databases imported yet</Text>}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleImport}
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

export default IndexScreen;
