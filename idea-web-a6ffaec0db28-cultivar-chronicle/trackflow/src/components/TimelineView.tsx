import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import EntryCard from './EntryCard';
import { Entry } from '../types';

interface TimelineViewProps {
  entries: Entry[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ entries }) => {
  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <EntryCard entry={item} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No entries yet. Add your first entry!</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TimelineView;
