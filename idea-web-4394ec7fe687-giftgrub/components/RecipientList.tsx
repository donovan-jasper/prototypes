import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Recipient } from '../types';

interface RecipientListProps {
  data: Recipient[];
  renderItem: ({ item }: { item: Recipient }) => React.ReactElement;
  keyExtractor: (item: Recipient) => string;
}

const RecipientList: React.FC<RecipientListProps> = ({ data, renderItem, keyExtractor }) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyList}>
          <Text style={styles.emptyListText}>No recipients found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RecipientList;
