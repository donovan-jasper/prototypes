import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QueryBuilderProps {
  tables: string[];
  onQueryChange: (query: string) => void;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({ tables, onQueryChange }) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const toggleTable = (table: string) => {
    const newSelectedTables = selectedTables.includes(table)
      ? selectedTables.filter((t) => t !== table)
      : [...selectedTables, table];
    setSelectedTables(newSelectedTables);
    updateQuery(newSelectedTables, selectedColumns);
  };

  const toggleColumn = (column: string) => {
    const newSelectedColumns = selectedColumns.includes(column)
      ? selectedColumns.filter((c) => c !== column)
      : [...selectedColumns, column];
    setSelectedColumns(newSelectedColumns);
    updateQuery(selectedTables, newSelectedColumns);
  };

  const updateQuery = (tables: string[], columns: string[]) => {
    let query = 'SELECT ';
    query += columns.length > 0 ? columns.join(', ') : '*';
    query += ' FROM ';
    query += tables.length > 0 ? tables.join(', ') : 'table';
    onQueryChange(query);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tables</Text>
      <View style={styles.list}>
        {tables.map((table) => (
          <TouchableOpacity
            key={table}
            style={[
              styles.item,
              selectedTables.includes(table) && styles.selectedItem,
            ]}
            onPress={() => toggleTable(table)}
          >
            <Text>{table}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.title}>Columns</Text>
      <View style={styles.list}>
        {['id', 'name', 'date', 'amount'].map((column) => (
          <TouchableOpacity
            key={column}
            style={[
              styles.item,
              selectedColumns.includes(column) && styles.selectedItem,
            ]}
            onPress={() => toggleColumn(column)}
          >
            <Text>{column}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  item: {
    padding: 8,
    margin: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  selectedItem: {
    backgroundColor: '#007AFF',
  },
});

export default QueryBuilder;
