import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Table, Relationship } from '../types/schema';
import { useNetworkStore } from '../store/network-store';

interface SchemaTreeProps {
  tables: Table[];
  relationships: Relationship[];
  onTablePress: (tableName: string) => void;
}

const SchemaTree: React.FC<SchemaTreeProps> = ({ tables, relationships, onTablePress }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const { isOnline } = useNetworkStore();

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const renderTable = ({ item: table }: { item: Table }) => {
    const relatedTables = relationships
      .filter(rel => rel.fromTable === table.name || rel.toTable === table.name)
      .map(rel => rel.fromTable === table.name ? rel.toTable : rel.fromTable);

    return (
      <View style={styles.tableContainer}>
        <TouchableOpacity
          style={styles.tableHeader}
          onPress={() => toggleTable(table.name)}
        >
          <Text style={styles.tableName}>{table.name}</Text>
          <Text style={styles.columnCount}>{table.columns.length} columns</Text>
        </TouchableOpacity>

        {expandedTables[table.name] && (
          <View style={styles.tableDetails}>
            <FlatList
              data={table.columns}
              keyExtractor={(column) => column.name}
              renderItem={({ item: column }) => (
                <View style={styles.columnItem}>
                  <Text style={styles.columnName}>{column.name}</Text>
                  <Text style={styles.columnType}>{column.type}</Text>
                </View>
              )}
            />

            {relatedTables.length > 0 && (
              <View style={styles.relationshipsSection}>
                <Text style={styles.sectionTitle}>Relationships</Text>
                {relatedTables.map(relatedTable => (
                  <TouchableOpacity
                    key={relatedTable}
                    style={styles.relatedTable}
                    onPress={() => onTablePress(relatedTable)}
                  >
                    <Text style={styles.relatedTableText}>{relatedTable}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Using cached schema</Text>
        </View>
      )}

      <FlatList
        data={tables}
        keyExtractor={(table) => table.name}
        renderItem={renderTable}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: '#f8d7da',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  tableContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  tableHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  columnCount: {
    fontSize: 14,
    color: '#666',
  },
  tableDetails: {
    padding: 16,
  },
  columnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  columnName: {
    fontSize: 14,
  },
  columnType: {
    fontSize: 14,
    color: '#666',
  },
  relationshipsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  relatedTable: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 4,
  },
  relatedTableText: {
    fontSize: 14,
  },
});

export default SchemaTree;
