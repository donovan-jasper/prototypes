import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface QueryResultsProps {
  data: any[];
  highlightFields?: string[];
}

const QueryResults: React.FC<QueryResultsProps> = ({ data, highlightFields = [] }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No results found</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    // Get all keys except 'id' if it exists
    const keys = Object.keys(item).filter(key => key !== 'id');

    return (
      <Card style={styles.card}>
        <Card.Content>
          {keys.map((key) => (
            <View key={key} style={styles.row}>
              <Text variant="labelMedium" style={[
                styles.label,
                highlightFields.includes(key) && styles.highlightedLabel
              ]}>
                {key.replace(/_/g, ' ')}:
              </Text>
              <Text variant="bodyMedium" style={[
                styles.value,
                highlightFields.includes(key) && styles.highlightedValue
              ]}>
                {item[key]}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  value: {
    flex: 1,
  },
  highlightedLabel: {
    color: '#4CAF50',
  },
  highlightedValue: {
    fontWeight: 'bold',
  },
  separator: {
    height: 8,
  },
});

export default QueryResults;
