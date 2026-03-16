import React from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';

const RowList = ({ rows }) => {
  return (
    <FlatList
      data={rows}
      renderItem={({ item }) => <Text style={styles.row}>{JSON.stringify(item)}</Text>}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default RowList;
