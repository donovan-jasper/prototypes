import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ContentCard from '../../components/ContentCard';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useUserStore } from '../../store/useUserStore';
import { Ionicons } from '@expo/vector-icons';

export default function LibraryScreen() {
  const router = useRouter();
  const { loadContent } = usePlayerStore();
  const { isPremium } = useUserStore();
  const [contentLibrary, setContentLibrary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('stories');

  useEffect(() => {
    // Load content library based on selected category
    const loadLibrary = async () => {
      // In a real app, this would fetch from an API or database
      const stories = [
        { id: 'story-1', title: 'Ocean Waves', duration: 15, isPremium: false },
        { id: 'story-2', title: 'Whispering Forest', duration: 12, isPremium: false },
        { id: 'story-3', title: 'Starlight Journey', duration: 18, isPremium: true },
      ];

      const soundscapes = [
        { id: 'soundscape-1', title: 'Rain on Roof', duration: 30, isPremium: false },
        { id: 'soundscape-2', title: 'Ocean Waves', duration: 30, isPremium: false },
        { id: 'soundscape-3', title: 'White Noise', duration: 30, isPremium: true },
      ];

      setContentLibrary(selectedCategory === 'stories' ? stories : soundscapes);
    };

    loadLibrary();
  }, [selectedCategory]);

  const handleContentPress = (contentId) => {
    loadContent(contentId);
    router.push('/player');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>Choose your sleep content</Text>
      </View>

      <View style={styles.categorySelector}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'stories' && styles.selectedCategoryButton,
          ]}
          onPress={() => setSelectedCategory('stories')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === 'stories' && styles.selectedCategoryButtonText,
            ]}
          >
            Stories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'soundscapes' && styles.selectedCategoryButton,
          ]}
          onPress={() => setSelectedCategory('soundscapes')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === 'soundscapes' && styles.selectedCategoryButtonText,
            ]}
          >
            Soundscapes
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contentLibrary}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContentCard
            title={item.title}
            duration={item.duration}
            isPremium={item.isPremium && !isPremium}
            onPress={() => handleContentPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  categorySelector: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
});
