import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SchemaDiffReportItem } from '../types/database';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface SchemaDiffItemProps {
  item: SchemaDiffReportItem;
}

const SchemaDiffItem: React.FC<SchemaDiffItemProps> = ({ item }) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (item.type) {
      case 'added':
        return <MaterialIcons name="add-circle" size={24} color={colors.primary} />;
      case 'removed':
        return <MaterialIcons name="remove-circle" size={24} color={colors.error} />;
      case 'modified':
        return <MaterialIcons name="edit" size={24} color={colors.accent} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (item.diffType) {
      case 'table':
        return `${item.type === 'added' ? 'Added' : 'Removed'} table: ${item.tableName}`;
      case 'column':
        return `${item.type === 'added' ? 'Added' : 'Removed'} column: ${item.columnName}`;
      default:
        return '';
    }
  };

  const getDetails = () => {
    switch (item.diffType) {
      case 'table':
        return `Columns: ${item.columns?.length || 0}`;
      case 'column':
        return `Type: ${item.columnType || 'unknown'}`;
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
        <Text style={[styles.details, { color: colors.onSurface }]}>{getDetails()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
  },
});

export default SchemaDiffItem;
