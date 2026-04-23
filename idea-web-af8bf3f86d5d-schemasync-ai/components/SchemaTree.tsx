import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Table, Relationship } from '../types/schema';
import { useNetworkStore } from '../store/network-store';
import { useDatabaseStore } from '../store/database-store';
import { MaterialIcons } from '@expo/vector-icons';

interface SchemaTreeProps {
  databaseId: string;
  onTablePress: (tableName: string) => void;
}

const SchemaTree: React.FC<SchemaTreeProps> = ({ databaseId, onTablePress }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const { isOnline, isInitializing } = useNetworkStore();
  const { databases, isLoading, error, refreshSchema } = useDatabaseStore();

  const database = databases.find(db => db.id === databaseId);
  const schema = database?.schema;
  const tables = schema?.tables || [];
  const relationships = schema?.relationships || [];

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const handleRefresh = async () => {
    if (isOnline) {
      await refreshSchema(databaseId);
    }
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
          <View style={styles.headerRight}>
            <Text style={styles.columnCount}>{table.columns.length} columns</Text>
            <MaterialIcons
              name={expandedTables[table.name] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="#666"
            />
          </View>
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

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking network status...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading schema...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        {isOnline && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="signal-wifi-off" size={16} color="#721c24" />
          <Text style={styles.offlineText}>Offline Mode - Using cached schema</Text>
          {schema?.isCached && (
            <Text style={styles.cachedTime}>
              Last updated: {new Date(schema.lastUpdated).toLocaleString()}
            </Text>
          )}
        </View>
      )}

      {isOnline && schema?.isCached && (
        <View style={styles.onlineBanner}>
          <MaterialIcons name="cloud-done" size={16} color="#0a3d62" />
          <Text style={styles.onlineText}>Online - Schema is up to date</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.refreshLink}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tables}
        keyExtractor={(table) => table.name}
        renderItem={renderTable}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="database" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tables found in schema</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  offlineBanner: {
    backgroundColor: '#f8d7da',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#721c24',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cachedTime: {
    color: '#721c24',
    fontSize: 12,
    marginLeft: 8,
  },
  onlineBanner: {
    backgroundColor: '#d1ecf1',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineText: {
    color: '#0a3d62',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  refreshLink: {
    color: '#007AFF',
    marginLeft: 8,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  columnCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SchemaTree;
