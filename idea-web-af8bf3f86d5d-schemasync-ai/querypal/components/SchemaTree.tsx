import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Text } from 'react-native-paper';

const SchemaTree = ({ schema, searchQuery }) => {
  if (!schema || schema.tables.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No schema available</Text>
      </View>
    );
  }

  const filteredTables = schema.tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {filteredTables.map(table => (
        <List.Accordion
          key={table.name}
          title={table.name}
          left={props => <List.Icon {...props} icon="table" />}
        >
          {table.columns.map(column => (
            <List.Item
              key={column.name}
              title={column.name}
              description={column.type}
              left={props => <List.Icon {...props} icon="column" />}
            />
          ))}
        </List.Accordion>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SchemaTree;
