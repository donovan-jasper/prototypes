import React, { useState } from 'react';
import { View, Text, Button, Picker, TextInput, StyleSheet } from 'react-native';
import { useFileStore } from '../store/files';

const QueryBuilder = ({ onGenerate }) => {
  const { files } = useFileStore();
  const [table, setTable] = useState('');
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState('');
  const [limit, setLimit] = useState('100');

  const handleGenerate = () => {
    const sql = `SELECT ${columns.join(', ')} FROM ${table} ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''} ${sort ? `ORDER BY ${sort}` : ''} LIMIT ${limit}`;
    onGenerate(sql);
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={table}
        onValueChange={(itemValue) => setTable(itemValue)}
      >
        {files.map((file) => (
          <Picker.Item key={file.id} label={file.name} value={file.id} />
        ))}
      </Picker>
      {/* Add column selectors, filter builder, sort selector, limit input */}
      <Button title="Generate SQL" onPress={handleGenerate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default QueryBuilder;
