import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { DataTable, Text } from 'react-native-paper';

export default function ResultsTable({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const columns = Object.keys(data[0]);

  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          {columns.map((column) => (
            <DataTable.Title key={column}>
              <Text>{column}</Text>
            </DataTable.Title>
          ))}
        </DataTable.Header>
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <DataTable.Row>
              {columns.map((column) => (
                <DataTable.Cell key={column}>
                  <Text>{item[column]}</Text>
                </DataTable.Cell>
              ))}
            </DataTable.Row>
          )}
        />
      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
