import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const MetaTrackerScreen = () => {
  const [filter, setFilter] = useState('all');
  const [metaItems] = useState([
    { id: '1', name: 'Gjallarhorn', game: 'Destiny 2', trend: 'up', usage: '+15%', category: 'weapon' },
    { id: '2', name: 'Kuva Bramma', game: 'Warframe', trend: 'down', usage: '-8%', category: 'weapon' },
    { id: '3', name: 'Shako', game: 'Diablo IV', trend: 'up', usage: '+22%', category: 'armor' },
    { id: '4', name: 'Headhunter', game: 'Path of Exile', trend: 'stable', usage: '0%', category: 'armor' },
    { id: '5', name: 'Fatebringer', game: 'Destiny 2', trend: 'up', usage: '+12%', category: 'weapon' },
  ]);

  const filteredItems = filter === 'all' 
    ? metaItems 
    : metaItems.filter(item => item.category === filter);

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#34C759';
      case 'down': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const renderMetaItem = ({ item }) => (
    <View style={styles.metaCard}>
      <View style={styles.metaHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={[styles.trendBadge, { backgroundColor: getTrendColor(item.trend) }]}>
          <Text style={styles.trendIcon}>{getTrendIcon(item.trend)}</Text>
          <Text style={styles.trendText}>{item.usage}</Text>
        </View>
      </View>
      <Text style={styles.gameName}>{item.game}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meta Tracker</Text>
      <Text style={styles.description}>
        Track real-time trends for weapons and gear across your favorite games.
      </Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'weapon' && styles.filterButtonActive]}
          onPress={() => setFilter('weapon')}
        >
          <Text style={[styles.filterText, filter === 'weapon' && styles.filterTextActive]}>Weapons</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'armor' && styles.filterButtonActive]}
          onPress={() => setFilter('armor')}
        >
          <Text style={[styles.filterText, filter === 'armor' && styles.filterTextActive]}>Armor</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMetaItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  metaCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gameName: {
    fontSize: 14,
    color: '#666',
  },
});

export default MetaTrackerScreen;
