import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { getVoiceClipsByCategory, getClipsByCategoryAndMood } from '../../services/voiceLibrary';
import VoicePlayer from '../../components/VoicePlayer';
import { VoiceClip } from '../../types';

const categories = ['all', 'morning', 'focus', 'energy', 'calm', 'celebrate'];
const moods = ['struggling', 'neutral', 'crushing'];

const LibraryScreen = () => {
  const { isPremiumUser } = useSubscription();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceClips, setVoiceClips] = useState<VoiceClip[]>([]);

  useEffect(() => {
    loadVoiceClips();
  }, [selectedCategory, selectedMood, searchQuery]);

  const loadVoiceClips = () => {
    let clips = getClipsByCategoryAndMood(selectedCategory, selectedMood);

    if (searchQuery) {
      clips = clips.filter(clip =>
        clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setVoiceClips(clips);
  };

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.selectedCategoryButtonText
      ]}>
        {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderMoodButton = (mood: string) => (
    <TouchableOpacity
      key={mood}
      style={[
        styles.moodButton,
        selectedMood === mood && styles.selectedMoodButton
      ]}
      onPress={() => setSelectedMood(mood)}
    >
      <Text style={[
        styles.moodButtonText,
        selectedMood === mood && styles.selectedMoodButtonText
      ]}>
        {mood.charAt(0).toUpperCase() + mood.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Library</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clips..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Categories</Text>
          <View style={styles.categoryButtons}>
            {categories.map(renderCategoryButton)}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Mood</Text>
          <View style={styles.moodButtons}>
            {moods.map(renderMoodButton)}
          </View>
        </View>
      </View>

      <FlatList
        data={voiceClips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VoicePlayer
            clip={item}
            isPremiumUser={isPremiumUser}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clips found matching your criteria</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#333',
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedMoodButton: {
    backgroundColor: '#4CAF50',
  },
  moodButtonText: {
    color: '#333',
    fontSize: 14,
  },
  selectedMoodButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LibraryScreen;
