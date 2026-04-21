import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { SchemaDiffReportItem, ColumnSchema } from '../types/database'; // Import types

interface SchemaDiffItemProps {
  item: SchemaDiffReportItem;
}

const SchemaDiffItem: React.FC<SchemaDiffItemProps> = ({ item }) => {
  const { colors } = useTheme();

  // Use specific green/red colors as per spec
  const addedColor = '#4CAF50'; // Green
  const removedColor = '#F44336'; // Red

  const getIcon = () => {
    if (item.type === 'added') {
      return <MaterialIcons name="add-circle" size={20} color={addedColor} />;
    } else if (item.type === 'removed') {
      return <MaterialIcons name="remove-circle" size={20} color={removedColor} />;
    }
    return null;
  };

  const getBorderColor = () => {
    if (item.type === 'added') {
      return addedColor;
    } else if (item.type === 'removed') {
      return removedColor;
    }
    return colors.text; // Fallback, though diff items should always be added/removed
  };

  const getTitleText = () => {
    if (item.diffType === 'table') {
      return `${item.type === 'added' ? 'Added table:' : 'Removed table:'} ${item.tableName}`;
    } else { // diffType === 'column'
      return `${item.type === 'added' ? 'Added columns to' : 'Removed columns from'} table: ${item.tableName}`;
    }
  };

  return (
    <View style={[styles.container, { borderColor: getBorderColor() }]}>
      <View style={styles.header}>
        {getIcon()}
        <Text style={[styles.title, { color: getBorderColor() }]}>
          {getTitleText()}
        </Text>
      </View>

      {item.columns && item.columns.length > 0 && (
        <View style={styles.columnsContainer}>
          {item.columns.map((column: ColumnSchema) => (
            <View key={column.name} style={styles.columnItem}>
              <Text style={[styles.columnName, { color: colors.text }]}>
                {column.name}
              </Text>
              <Text style={[styles.columnType, { color: colors.onSurfaceVariant }]}>
                {column.type}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  columnsContainer: {
    marginTop: 8,
    paddingLeft: 28, // Indent columns slightly
  },
  columnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  columnName: {
    fontSize: 14,
  },
  columnType: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default SchemaDiffItem;
