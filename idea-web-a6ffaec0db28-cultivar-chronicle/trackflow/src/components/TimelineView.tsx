import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import EntryCard from './EntryCard';
import { Entry } from '../types';

interface TimelineViewProps {
  entries: Entry[];
  onRefresh?: () => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ entries, onRefresh }) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <EntryCard entry={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No entries yet. Tap + to add your first entry!</Text>
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
    padding: 32,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TimelineView;
