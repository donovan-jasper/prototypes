import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Searchbar, useTheme, Button, IconButton } from 'react-native-paper';
import { useEmailStore } from '../../store/email-store';
import EmailCard from '../../components/EmailCard';

const ScanScreen = () => {
  const theme = useTheme();
  const { senders, loadSenders, isLoading, scanInbox } = useEmailStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unsubscribe' | 'tracking'>('all');

  useEffect(() => {
    loadSenders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await scanInbox();
    await loadSenders();
    setRefreshing(false);
  };

  const filteredSenders = senders.filter(sender => {
    const matchesSearch = sender.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sender.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      (filter === 'all') ||
      (filter === 'unsubscribe' && sender.tags.includes('unsubscribe-available')) ||
      (filter === 'tracking' && sender.tags.includes('tracking'));

    return matchesSearch && matchesFilter;
  });

  const renderItem = ({ item }: { item: any }) => (
    <EmailCard sender={item} />
  );

  const emptyComponent = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No senders found
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'Your inbox is clean!'
              : `No senders match your ${filter} filter`}
          </Text>
          <Button
            mode="contained"
            onPress={onRefresh}
            style={styles.emptyButton}
            contentStyle={styles.emptyButtonContent}
          >
            Scan Inbox
          </Button>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search senders"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      <View style={styles.filterContainer}>
        <Button
          mode={filter === 'all' ? 'contained' : 'outlined'}
          onPress={() => setFilter('all')}
          style={styles.filterButton}
        >
          All
        </Button>
        <Button
          mode={filter === 'unsubscribe' ? 'contained' : 'outlined'}
          onPress={() => setFilter('unsubscribe')}
          style={styles.filterButton}
        >
          Unsubscribe
        </Button>
        <Button
          mode={filter === 'tracking' ? 'contained' : 'outlined'}
          onPress={() => setFilter('tracking')}
          style={styles.filterButton}
        >
          Tracking
        </Button>
      </View>

      <FlatList
        data={filteredSenders}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={emptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    borderRadius: 20,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  listContent: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    paddingVertical: 8,
  },
  emptyButtonContent: {
    height: 40,
  },
});

export default ScanScreen;
