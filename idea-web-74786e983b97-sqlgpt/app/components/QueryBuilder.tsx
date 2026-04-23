import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QueryBuilderProps {
  tables: string[];
  onQueryChange: (query: string) => void;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({ tables, onQueryChange }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ field: string; operator: string; value: string }[]>([]);

  const tableColumns: Record<string, string[]> = {
    sales: ['id', 'amount', 'date', 'customer_id', 'product_id'],
    customers: ['id', 'name', 'email', 'phone', 'join_date'],
    orders: ['id', 'customer_id', 'order_date', 'status', 'total'],
    products: ['id', 'name', 'price', 'category', 'stock']
  };

  const handleTableSelect = (table: string) => {
    setSelectedTable(table);
    setSelectedColumns([]);
    setFilters([]);
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const buildQuery = () => {
    if (!selectedTable) return '';

    let query = `SELECT ${selectedColumns.length > 0 ? selectedColumns.join(', ') : '*'} FROM ${selectedTable}`;

    if (filters.length > 0) {
      const filterConditions = filters.map(filter =>
        `${filter.field} ${filter.operator} '${filter.value}'`
      );
      query += ` WHERE ${filterConditions.join(' AND ')}`;
    }

    query += ';';
    onQueryChange(query);
    return query;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Query Builder</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Select Table:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tables.map(table => (
            <TouchableOpacity
              key={table}
              style={[
                styles.tableButton,
                selectedTable === table && styles.tableButtonSelected
              ]}
              onPress={() => handleTableSelect(table)}
            >
              <Text style={[
                styles.tableButtonText,
                selectedTable === table && styles.tableButtonTextSelected
              ]}>
                {table}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedTable && (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Select Columns:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tableColumns[selectedTable].map(column => (
                <TouchableOpacity
                  key={column}
                  style={[
                    styles.columnButton,
                    selectedColumns.includes(column) && styles.columnButtonSelected
                  ]}
                  onPress={() => toggleColumn(column)}
                >
                  <Text style={[
                    styles.columnButtonText,
                    selectedColumns.includes(column) && styles.columnButtonTextSelected
                  ]}>
                    {column}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Filters:</Text>
            <TouchableOpacity
              style={styles.addFilterButton}
              onPress={() => setFilters([...filters, { field: '', operator: '=', value: '' }])}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addFilterText}>Add Filter</Text>
            </TouchableOpacity>

            {filters.map((filter, index) => (
              <View key={index} style={styles.filterRow}>
                <Text style={styles.filterLabel}>Field:</Text>
                <Text style={styles.filterValue}>{filter.field || 'Select field'}</Text>
                <Text style={styles.filterLabel}>Operator:</Text>
                <Text style={styles.filterValue}>{filter.operator}</Text>
                <Text style={styles.filterLabel}>Value:</Text>
                <Text style={styles.filterValue}>{filter.value || 'Enter value'}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.buildButton}
            onPress={buildQuery}
          >
            <Text style={styles.buildButtonText}>Build Query</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tableButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  tableButtonSelected: {
    backgroundColor: '#007AFF',
  },
  tableButtonText: {
    color: '#333',
  },
  tableButtonTextSelected: {
    color: 'white',
  },
  columnButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  columnButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  columnButtonText: {
    color: '#333',
  },
  columnButtonTextSelected: {
    color: 'white',
  },
  addFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  addFilterText: {
    marginLeft: 4,
    color: '#007AFF',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  filterLabel: {
    marginRight: 4,
    fontWeight: '600',
  },
  filterValue: {
    marginRight: 8,
    padding: 4,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  buildButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  buildButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default QueryBuilder;
