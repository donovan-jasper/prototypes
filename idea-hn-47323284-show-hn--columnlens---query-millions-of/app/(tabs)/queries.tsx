import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryStore } from '../../store/queries';

const QueriesScreen = () => {
  const navigation = useNavigation();
  const { queries, deleteQuery } = useQueryStore();

  const handleQueryPress = (id) => {
    navigation.navigate('Query', { id });
  };

  const handleDelete = (id) => {
    deleteQuery(id);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={queries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.queryItem}>
            <Text>{item.name}</Text>
            <Text>{item.sql}</Text>
            <Button title="Open" onPress={() => handleQueryPress(item.id)} />
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  queryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default QueriesScreen;
