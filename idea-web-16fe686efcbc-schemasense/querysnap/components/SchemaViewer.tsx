import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SchemaViewer = ({ schema }) => {
  return (
    <View style={styles.container}>
      {schema.tables.map((table) => (
        <View key={table} style={styles.table}>
          <Text style={styles.tableName}>{table}</Text>
          {schema.columns[table].map((column) => (
            <Text key={column} style={styles.column}>
              {column}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  table: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  tableName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  column: {
    marginLeft: 8,
  },
});

export default SchemaViewer;
