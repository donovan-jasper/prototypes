import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';

interface QueryBuilderProps {
  tables: string[];
  initialQuery?: string;
  onQueryChange: (query: string) => void;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({ tables, initialQuery = '', onQueryChange }) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [whereConditions, setWhereConditions] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [query, setQuery] = useState<string>(initialQuery);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      const database = SQLite.openDatabase('querymentor.db');
      setDb(database);

      // Create sample tables if they don't exist
      database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL, date TEXT, product_id INTEGER);',
          [],
          () => console.log('Sales table created'),
          (_, error) => console.log('Error creating sales table:', error)
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT);',
          [],
          () => console.log('Customers table created'),
          (_, error) => console.log('Error creating customers table:', error)
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, order_date TEXT, total REAL);',
          [],
          () => console.log('Orders table created'),
          (_, error) => console.log('Error creating orders table:', error)
        );
      });
    };

    initializeDB();
  }, []);

  useEffect(() => {
    // Update the query when initialQuery changes
    if (initialQuery) {
      setQuery(initialQuery);
      onQueryChange(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!initialQuery) {
      buildQuery();
    }
  }, [selectedTables, selectedColumns, whereConditions, orderBy, limit]);

  const buildQuery = () => {
    let newQuery = '';

    if (selectedTables.length > 0) {
      const columns = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
      newQuery = `SELECT ${columns} FROM ${selectedTables.join(', ')}`;

      if (whereConditions.length > 0) {
        newQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      if (orderBy) {
        newQuery += ` ORDER BY ${orderBy}`;
      }

      if (limit) {
        newQuery += ` LIMIT ${limit}`;
      }

      newQuery += ';';
      setQuery(newQuery);
      onQueryChange(newQuery);
    } else {
      setQuery('');
      onQueryChange('');
    }
  };

  const toggleTable = (table: string) => {
    setSelectedTables(prev =>
      prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]
    );
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  const addWhereCondition = (condition: string) => {
    if (condition.trim()) {
      setWhereConditions(prev => [...prev, condition]);
    }
  };

  const removeWhereCondition = (index: number) => {
    setWhereConditions(prev => prev.filter((_, i) => i !== index));
  };

  const executeQuery = () => {
    if (!db || !query) return;

    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (_, { rows }) => {
          const results = [];
          for (let i = 0; i < rows.length; i++) {
            results.push(rows.item(i));
          }
          setQueryResults(results);
        },
        (_, error) => {
          console.log('Query execution error:', error);
          setQueryResults([{ error: error.message }]);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tables</Text>
      <View style={styles.tableContainer}>
        {tables.map(table => (
          <TouchableOpacity
            key={table}
            style={[
              styles.tableButton,
              selectedTables.includes(table) && styles.selectedTable
            ]}
            onPress={() => toggleTable(table)}
          >
            <Text style={styles.tableText}>{table}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTables.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Columns</Text>
          <View style={styles.columnContainer}>
            {selectedTables.map(table => (
              <View key={table} style={styles.tableColumns}>
                <Text style={styles.tableHeader}>{table}</Text>
                {['id', 'name', 'amount', 'date', 'email', 'total', 'customer_id', 'product_id'].map(column => (
                  <TouchableOpacity
                    key={column}
                    style={[
                      styles.columnButton,
                      selectedColumns.includes(column) && styles.selectedColumn
                    ]}
                    onPress={() => toggleColumn(column)}
                  >
                    <Text style={styles.columnText}>{column}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>WHERE Conditions</Text>
          <View style={styles.whereContainer}>
            {whereConditions.map((condition, index) => (
              <View key={index} style={styles.conditionItem}>
                <Text style={styles.conditionText}>{condition}</Text>
                <TouchableOpacity onPress={() => removeWhereCondition(index)}>
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.conditionInput}
              placeholder="Add condition (e.g., amount > 100)"
              onSubmitEditing={(e) => addWhereCondition(e.nativeEvent.text)}
            />
          </View>

          <Text style={styles.sectionTitle}>Order By</Text>
          <TextInput
            style={styles.input}
            placeholder="Column name"
            value={orderBy}
            onChangeText={setOrderBy}
          />

          <Text style={styles.sectionTitle}>Limit</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of rows"
            value={limit}
            onChangeText={setLimit}
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Generated Query</Text>
      <Text style={styles.queryText}>{query || 'No query generated yet'}</Text>

      <TouchableOpacity
        style={styles.executeButton}
        onPress={executeQuery}
        disabled={!query}
      >
        <Text style={styles.executeButtonText}>Execute Query</Text>
      </TouchableOpacity>

      {queryResults.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Results</Text>
          <ScrollView horizontal style={styles.resultsContainer}>
            <View>
              {queryResults.map((row, index) => (
                <View key={index} style={styles.resultRow}>
                  {Object.entries(row).map(([key, value]) => (
                    <Text key={key} style={styles.resultCell}>
                      {key}: {JSON.stringify(value)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tableButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  selectedTable: {
    backgroundColor: '#007AFF',
  },
  tableText: {
    color: '#333',
  },
  columnContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tableColumns: {
    marginRight: 16,
    marginBottom: 16,
  },
  tableHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  columnButton: {
    padding: 6,
    marginBottom: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  selectedColumn: {
    backgroundColor: '#007AFF',
  },
  columnText: {
    color: '#333',
  },
  whereContainer: {
    marginBottom: 16,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  conditionText: {
    color: '#333',
  },
  conditionInput: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  queryText: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  executeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  executeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
  },
  resultRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultCell: {
    marginRight: 16,
    fontFamily: 'monospace',
  },
});

export default QueryBuilder;
