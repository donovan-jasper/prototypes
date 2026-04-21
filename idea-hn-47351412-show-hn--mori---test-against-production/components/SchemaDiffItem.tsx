import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const SchemaDiffItem = ({ item }) => {
  const { theme } = useTheme();

  const getIcon = () => {
    if (item.type === 'added') {
      return <MaterialIcons name="add-circle" size={20} color="#4CAF50" />;
    } else if (item.type === 'removed') {
      return <MaterialIcons name="remove-circle" size={20} color="#F44336" />;
    }
    return null;
  };

  const getColor = () => {
    if (item.type === 'added') {
      return '#4CAF50';
    } else if (item.type === 'removed') {
      return '#F44336';
    }
    return theme.colors.text;
  };

  return (
    <View style={[styles.container, { borderColor: getColor() }]}>
      <View style={styles.header}>
        {getIcon()}
        <Text style={[styles.tableName, { color: getColor() }]}>
          {item.type === 'added' ? 'Added to' : 'Removed from'} {item.tableName}
        </Text>
      </View>

      {item.columns && item.columns.length > 0 && (
        <View style={styles.columnsContainer}>
          {item.columns.map((column) => (
            <View key={column.name} style={styles.columnItem}>
              <Text style={[styles.columnName, { color: theme.colors.text }]}>
                {column.name}
              </Text>
              <Text style={[styles.columnType, { color: theme.colors.secondary }]}>
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
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  columnsContainer: {
    marginTop: 8,
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
