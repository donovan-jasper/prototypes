import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import DatabaseCard from '../../components/DatabaseCard';

const DatabaseListScreen = () => {
  const { databases } = useStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={databases}
        renderItem={({ item }) => <DatabaseCard database={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default DatabaseListScreen;
