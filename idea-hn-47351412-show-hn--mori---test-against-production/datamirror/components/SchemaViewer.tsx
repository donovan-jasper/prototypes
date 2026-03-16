import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { DataTable, Text } from 'react-native-paper';

export default function SchemaViewer({ schema }) {
  if (!schema || schema.tables.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={schema.tables}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.tableContainer}>
            <Text variant="titleMedium">{item.name}</Text>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>
                  <Text>Column</Text>
                </DataTable.Title>
                <DataTable.Title>
                  <Text>Type</Text>
                </DataTable.Title>
              </DataTable.Header>
              {item.columns.map((column) => (
                <DataTable.Row key={column.name}>
                  <DataTable.Cell>
                    <Text>{column.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Text>{column.type}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  tableContainer: {
    marginBottom: 16,
  },
});
