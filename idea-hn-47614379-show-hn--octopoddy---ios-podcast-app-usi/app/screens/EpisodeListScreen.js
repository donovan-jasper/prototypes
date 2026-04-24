import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EpisodeListScreen = () => {
  const navigation = useNavigation();
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching episodes from an API
    const fetchEpisodes = async () => {
      try {
        // In a real app, this would be an API call
        const mockEpisodes = [
          {
            id: '1',
            title: 'Episode 1: The Beginning',
            podcastName: 'Tech Talk Daily',
            audioUrl: 'https://example.com/episode1.mp3',
            duration: 3600000, // 1 hour
          },
          {
            id: '2',
            title: 'Episode 2: Deep Dive',
            podcastName: 'Tech Talk Daily',
            audioUrl: 'https://example.com/episode2.mp3',
            duration: 4200000, // 1 hour 10 minutes
          },
          {
            id: '3',
            title: 'Episode 3: The Future',
            podcastName: 'Tech Talk Daily',
            audioUrl: 'https://example.com/episode3.mp3',
            duration: 3000000, // 50 minutes
          },
        ];

        setEpisodes(mockEpisodes);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching episodes:', error);
        setIsLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const formatDuration = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderEpisode = ({ item }) => (
    <TouchableOpacity
      style={styles.episodeItem}
      onPress={() => navigation.navigate('PodcastPlayer', { episode: item })}
    >
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeTitle}>{item.title}</Text>
        <Text style={styles.podcastName}>{item.podcastName}</Text>
      </View>
      <Text style={styles.episodeDuration}>{formatDuration(item.duration)}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Episodes</Text>
      <FlatList
        data={episodes}
        renderItem={renderEpisode}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContent: {
    paddingBottom: 20,
  },
  episodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  podcastName: {
    fontSize: 14,
    color: '#666',
  },
  episodeDuration: {
    fontSize: 14,
    color: '#666',
  },
});

export default EpisodeListScreen;
