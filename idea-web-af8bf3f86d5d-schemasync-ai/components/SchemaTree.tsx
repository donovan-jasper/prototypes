import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';

interface SchemaTreeProps {
  schema: {
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
      }>;
    }>;
    relationships: Array<{
      fromTable: string;
      fromColumn: string;
      toTable: string;
      toColumn: string;
      type: string;
    }>;
  };
}

const SchemaTree: React.FC<SchemaTreeProps> = ({ schema }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const getRelationshipsForTable = (tableName: string) => {
    return schema.relationships.filter(
      rel => rel.fromTable === tableName || rel.toTable === tableName
    );
  };

  return (
    <ScrollView style={styles.container}>
      {schema.tables.map(table => (
        <View key={table.name} style={styles.tableContainer}>
          <TouchableOpacity
            style={styles.tableHeader}
            onPress={() => toggleTable(table.name)}
          >
            <IconButton
              icon={expandedTables[table.name] ? 'chevron-down' : 'chevron-right'}
              size={20}
            />
            <Text style={styles.tableName}>{table.name}</Text>
            <Text style={styles.columnCount}>({table.columns.length} columns)</Text>
          </TouchableOpacity>

          {expandedTables[table.name] && (
            <View style={styles.tableDetails}>
              <View style={styles.columnsSection}>
                <Text style={styles.sectionTitle}>Columns</Text>
                {table.columns.map(column => (
                  <View key={column.name} style={styles.columnItem}>
                    <Text style={styles.columnName}>{column.name}</Text>
                    <Text style={styles.columnType}>{column.type}</Text>
                    {!column.nullable && <Text style={styles.requiredTag}>Required</Text>}
                  </View>
                ))}
              </View>

              <View style={styles.relationshipsSection}>
                <Text style={styles.sectionTitle}>Relationships</Text>
                {getRelationshipsForTable(table.name).length > 0 ? (
                  getRelationshipsForTable(table.name).map((rel, index) => (
                    <View key={index} style={styles.relationshipItem}>
                      <Text style={styles.relationshipText}>
                        {rel.fromTable === table.name
                          ? `→ ${rel.toTable} (${rel.type})`
                          : `← ${rel.fromTable} (${rel.type})`}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRelationships}>No relationships</Text>
                )}
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tableContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  columnCount: {
    fontSize: 14,
    color: '#666',
  },
  tableDetails: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  columnsSection: {
    marginBottom: 16,
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  columnName: {
    fontSize: 14,
    marginRight: 8,
  },
  columnType: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  requiredTag: {
    fontSize: 10,
    color: 'white',
    backgroundColor: '#ff5252',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  relationshipsSection: {
    marginTop: 8,
  },
  relationshipItem: {
    paddingVertical: 4,
  },
  relationshipText: {
    fontSize: 14,
  },
  noRelationships: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default SchemaTree;
