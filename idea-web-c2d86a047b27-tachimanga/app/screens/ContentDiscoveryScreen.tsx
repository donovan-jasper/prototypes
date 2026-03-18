import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { downloadContent } from '../utils/offlineLibrary';

interface ContentItem {
  id: string;
  title: string;
  coverUrl: string;
  description: string;
  chapterCount: number;
  text: string;
}

const SAMPLE_CATALOG: ContentItem[] = [
  {
    id: '1',
    title: 'Dragon Quest Chronicles',
    coverUrl: 'https://picsum.photos/seed/manga1/200/300',
    description: 'An epic fantasy adventure following a young hero destined to save the world from ancient evil.',
    chapterCount: 156,
    text: 'Chapter 1: The Beginning\n\nIn a world where magic flows through every living thing, a young warrior discovers their true destiny...'
  },
  {
    id: '2',
    title: 'Tokyo Midnight',
    coverUrl: 'https://picsum.photos/seed/manga2/200/300',
    description: 'A supernatural thriller set in modern Tokyo where spirits walk among humans.',
    chapterCount: 89,
    text: 'Chapter 1: The Awakening\n\nThe neon lights of Shibuya flickered as Akira sensed something was wrong...'
  },
  {
    id: '3',
    title: 'Starship Academy',
    coverUrl: 'https://picsum.photos/seed/manga3/200/300',
    description: 'Sci-fi action following cadets training to become elite space pilots.',
    chapterCount: 203,
    text: 'Chapter 1: First Day\n\nThe massive space station loomed ahead as the shuttle approached...'
  },
  {
    id: '4',
    title: 'Cooking Wars',
    coverUrl: 'https://picsum.photos/seed/manga4/200/300',
    description: 'Competitive cooking manga where chefs battle for culinary supremacy.',
    chapterCount: 124,
    text: 'Chapter 1: The Challenge\n\nThe kitchen was silent as Chef Tanaka unveiled the secret ingredient...'
  },
  {
    id: '5',
    title: 'Shadow Detective',
    coverUrl: 'https://picsum.photos/seed/manga5/200/300',
    description: 'Mystery thriller about a detective who can see the memories of the dead.',
    chapterCount: 67,
    text: 'Chapter 1: The First Case\n\nThe crime scene was cold, but Detective Sato could feel the echoes of what happened...'
  },
  {
    id: '6',
    title: 'Volleyball Dreams',
    coverUrl: 'https://picsum.photos/seed/manga6/200/300',
    description: 'Sports manga following a high school volleyball team aiming for nationals.',
    chapterCount: 178,
    text: 'Chapter 1: The Team\n\nThe gymnasium echoed with the sound of the ball hitting the floor...'
  }
];

const ContentDiscoveryScreen = () => {
  const navigation = useNavigation<any>();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (item: ContentItem) => {
    setDownloading(item.id);
    try {
      await downloadContent({
        title: item.title,
        text: item.text
      });
      Alert.alert(
        'Download Complete',
        `"${item.title}" has been added to your library!`,
        [
          {
            text: 'Go to Library',
            onPress: () => navigation.navigate('Library')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download content. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const renderItem = ({ item }: { item: ContentItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.coverUrl }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.chapters}>{item.chapterCount} chapters</Text>
        <TouchableOpacity
          style={[styles.downloadButton, downloading === item.id && styles.downloadingButton]}
          onPress={() => handleDownload(item)}
          disabled={downloading === item.id}
        >
          <Text style={styles.downloadButtonText}>
            {downloading === item.id ? 'Downloading...' : 'Download'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={SAMPLE_CATALOG}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chapters: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  downloadingButton: {
    backgroundColor: '#999',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ContentDiscoveryScreen;
