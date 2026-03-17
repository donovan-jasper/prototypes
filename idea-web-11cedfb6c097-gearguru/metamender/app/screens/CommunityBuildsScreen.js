import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const CommunityBuildsScreen = () => {
  const [builds] = useState([
    {
      id: '1',
      name: 'Solar Titan DPS',
      game: 'Destiny 2',
      author: 'GuardianPro',
      rating: 4.8,
      downloads: 1523,
    },
    {
      id: '2',
      name: 'Kuva Nukor Build',
      game: 'Warframe',
      author: 'TennoMaster',
      rating: 4.6,
      downloads: 892,
    },
    {
      id: '3',
      name: 'Necromancer Endgame',
      game: 'Diablo IV',
      author: 'DiabloVet',
      rating: 4.9,
      downloads: 2341,
    },
    {
      id: '4',
      name: 'Lightning Strike Raider',
      game: 'Path of Exile',
      author: 'ExileGuru',
      rating: 4.7,
      downloads: 1876,
    },
  ]);

  const renderBuild = ({ item }) => (
    <TouchableOpacity style={styles.buildCard}>
      <View style={styles.buildHeader}>
        <Text style={styles.buildName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>★ {item.rating}</Text>
        </View>
      </View>
      <Text style={styles.gameName}>{item.game}</Text>
      <View style={styles.buildFooter}>
        <Text style={styles.authorText}>by {item.author}</Text>
        <Text style={styles.downloadsText}>{item.downloads} downloads</Text>
      </View>
      <TouchableOpacity style={styles.importButton}>
        <Text style={styles.importButtonText}>Import Build</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Builds</Text>
      <Text style={styles.description}>
        Discover and import top-rated builds shared by the community.
      </Text>

      <FlatList
        data={builds}
        keyExtractor={(item) => item.id}
        renderItem={renderBuild}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Share Your Build</Text>
      </TouchableOpacity>
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
  listContainer: {
    paddingBottom: 20,
  },
  buildCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buildHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buildName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  gameName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buildFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
  },
  downloadsText: {
    fontSize: 14,
    color: '#666',
  },
  importButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CommunityBuildsScreen;
