import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TextInput, Switch, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFilesStore } from '../store/files';
import { useNavigation } from '@react-navigation/native';

interface Column {
  name: string;
  type: string;
}

interface Filter {
  column: string;
  operator: string;
  value: string;
}

interface Sort {
  column: string;
  direction: 'ASC' | 'DESC';
}

const QueryBuilder = () => {
  const navigation = useNavigation();
  const { files } = useFilesStore();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sort, setSort] = useState<Sort>({ column: '', direction: 'ASC' });
  const [limit, setLimit] = useState<string>('100');
  const [generatedSQL, setGeneratedSQL] = useState<string>('');

  // Mock function to get columns for a table
  const getColumnsForTable = (tableId: string): Column[] => {
    // In a real app, this would fetch from the database
    return [
      { name: 'id', type: 'INTEGER' },
      { name: 'name', type: 'TEXT' },
      { name: 'age', type: 'INTEGER' },
      { name: 'price', type: 'REAL' },
      { name: 'active', type: 'BOOLEAN' },
      { name: 'date', type: 'TEXT' }
    ];
  };

  useEffect(() => {
    if (selectedTable) {
      const tableColumns = getColumnsForTable(selectedTable);
      setColumns(tableColumns);
      setSelectedColumns(tableColumns.map(col => col.name));
    }
  }, [selectedTable]);

  const handleColumnToggle = (columnName: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnName)
        ? prev.filter(col => col !== columnName)
        : [...prev, columnName]
    );
  };

  const handleAddFilter = () => {
    if (columns.length === 0) {
      Alert.alert('Error', 'Please select a table first');
      return;
    }
    setFilters(prev => [...prev, { column: columns[0].name, operator: '=', value: '' }]);
  };

  const handleUpdateFilter = (index: number, field: keyof Filter, value: string) => {
    setFilters(prev => {
      const newFilters = [...prev];
      newFilters[index] = { ...newFilters[index], [field]: value };
      return newFilters;
    });
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleSortChange = (field: keyof Sort, value: string) => {
    setSort(prev => ({ ...prev, [field]: value }));
  };

  const generateSQL = () => {
    if (!selectedTable) {
      Alert.alert('Error', 'Please select a table');
      return;
    }

    const selectClause = selectedColumns.length > 0
      ? selectedColumns.map(col => `"${col}"`).join(', ')
      : '*';

    const fromClause = `"${selectedTable}"`;

    const whereClauses = filters
      .filter(f => f.column && f.value)
      .map(f => {
        if (f.operator === 'LIKE') {
          return `"${f.column}" LIKE '%${f.value}%'`;
        }
        return `"${f.column}" ${f.operator} '${f.value}'`;
      });

    const whereClause = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    const orderByClause = sort.column
      ? `ORDER BY "${sort.column}" ${sort.direction}`
      : '';

    const limitClause = `LIMIT ${limit}`;

    const sql = `SELECT ${selectClause} FROM ${fromClause} ${whereClause} ${orderByClause} ${limitClause}`;
    setGeneratedSQL(sql);
  };

  const handleRunQuery = () => {
    if (!generatedSQL) {
      Alert.alert('Error', 'Please generate SQL first');
      return;
    }

    navigation.navigate('Query', {
      id: Date.now().toString(),
      sql: generatedSQL
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Table Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Table</Text>
        <Picker
          selectedValue={selectedTable}
          onValueChange={(itemValue) => setSelectedTable(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a table" value="" />
          {files.map((file) => (
            <Picker.Item key={file.id} label={file.name} value={file.id} />
          ))}
        </Picker>
      </View>

      {/* Column Selector */}
      {selectedTable && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Columns</Text>
          {columns.map((column) => (
            <View key={column.name} style={styles.columnItem}>
              <Switch
                value={selectedColumns.includes(column.name)}
                onValueChange={() => handleColumnToggle(column.name)}
              />
              <Text style={styles.columnName}>{column.name}</Text>
              <Text style={styles.columnType}>({column.type})</Text>
            </View>
          ))}
        </View>
      )}

      {/* Filter Builder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filters</Text>
        {filters.map((filter, index) => (
          <View key={index} style={styles.filterRow}>
            <Picker
              selectedValue={filter.column}
              onValueChange={(value) => handleUpdateFilter(index, 'column', value)}
              style={styles.filterPicker}
            >
              {columns.map((col) => (
                <Picker.Item key={col.name} label={col.name} value={col.name} />
              ))}
            </Picker>

            <Picker
              selectedValue={filter.operator}
              onValueChange={(value) => handleUpdateFilter(index, 'operator', value)}
              style={styles.filterPicker}
            >
              <Picker.Item label="=" value="=" />
              <Picker.Item label=">" value=">" />
              <Picker.Item label="<" value="<" />
              <Picker.Item label="LIKE" value="LIKE" />
              <Picker.Item label=">=" value=">=" />
              <Picker.Item label="<=" value="<=" />
              <Picker.Item label="!=" value="!=" />
            </Picker>

            <TextInput
              style={styles.filterInput}
              value={filter.value}
              onChangeText={(value) => handleUpdateFilter(index, 'value', value)}
              placeholder="Value"
            />

            <Button
              title="Remove"
              onPress={() => handleRemoveFilter(index)}
              color="#ff3b30"
            />
          </View>
        ))}
        <Button title="Add Filter" onPress={handleAddFilter} />
      </View>

      {/* Sort Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort</Text>
        <View style={styles.sortRow}>
          <Picker
            selectedValue={sort.column}
            onValueChange={(value) => handleSortChange('column', value)}
            style={styles.sortPicker}
          >
            <Picker.Item label="Select column" value="" />
            {columns.map((col) => (
              <Picker.Item key={col.name} label={col.name} value={col.name} />
            ))}
          </Picker>

          <Picker
            selectedValue={sort.direction}
            onValueChange={(value) => handleSortChange('direction', value)}
            style={styles.sortPicker}
          >
            <Picker.Item label="ASC" value="ASC" />
            <Picker.Item label="DESC" value="DESC" />
          </Picker>
        </View>
      </View>

      {/* Limit Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limit</Text>
        <TextInput
          style={styles.limitInput}
          value={limit}
          onChangeText={setLimit}
          keyboardType="numeric"
          placeholder="100"
        />
      </View>

      {/* Generate SQL Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Generate SQL"
          onPress={generateSQL}
          disabled={!selectedTable}
        />
        <Button
          title="Run Query"
          onPress={handleRunQuery}
          disabled={!generatedSQL}
        />
      </View>

      {/* SQL Output */}
      {generatedSQL && (
        <View style={styles.sqlOutput}>
          <Text style={styles.sqlTitle}>Generated SQL:</Text>
          <TextInput
            style={styles.sqlText}
            value={generatedSQL}
            multiline
            editable={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  columnName: {
    marginLeft: 10,
    fontSize: 14,
  },
  columnType: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterPicker: {
    flex: 1,
    height: 40,
  },
  filterInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginHorizontal: 5,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortPicker: {
    flex: 1,
    height: 40,
  },
  limitInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sqlOutput: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sqlTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sqlText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});

export default QueryBuilder;
