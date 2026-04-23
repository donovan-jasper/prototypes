import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SentimentFilterProps {
  currentFilter: 'all' | 'bullish' | 'bearish' | 'neutral';
  onFilterChange: (filter: 'all' | 'bullish' | 'bearish' | 'neutral') => void;
}

const SentimentFilter: React.FC<SentimentFilterProps> = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Bullish', value: 'bullish' },
    { label: 'Bearish', value: 'bearish' },
    { label: 'Neutral', value: 'neutral' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.value}
          style={[
            styles.filterButton,
            currentFilter === filter.value && styles.activeFilterButton,
          ]}
          onPress={() => onFilterChange(filter.value as any)}
        >
          <Text
            style={[
              styles.filterText,
              currentFilter === filter.value && styles.activeFilterText,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  activeFilterButton: {
    backgroundColor: '#007aff',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SentimentFilter;
