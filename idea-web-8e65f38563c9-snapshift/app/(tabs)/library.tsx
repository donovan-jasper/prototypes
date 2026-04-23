import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VoicePlayer from '../../components/VoicePlayer';
import { getVoiceClipsByCategory, getClipsByCategoryAndMood, getRotatingFreeClips } from '../../services/voiceLibrary';
import { VoiceClip, Mood } from '../../types';
import { useSubscription } from '../../hooks/useSubscription';

const categories = ['all', 'morning', 'focus', 'energy', 'calm', 'celebrate'];
const moods: Mood[] = ['struggling', 'neutral', 'crushing'];

const LibraryScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMood, setSelectedMood] = useState<Mood>('neutral');
  const [voiceClips, setVoiceClips] = useState<VoiceClip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isPremium } = useSubscription();

  useEffect(() => {
    loadVoiceClips();
  }, [selectedCategory, selectedMood, isPremium]);

  const loadVoiceClips = async () => {
    setIsLoading(true);
    try {
      if (selectedMood !== 'neutral') {
        setVoiceClips(getClipsByCategoryAndMood(selectedCategory, selectedMood));
      } else {
        setVoiceClips(getVoiceClipsByCategory(selectedCategory));
      }
    } catch (error) {
      console.error('Error loading voice clips', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item && styles.selectedCategoryText
      ]}>
        {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderMoodItem = ({ item }: { item: Mood }) => (
    <TouchableOpacity
      style={[
        styles.moodItem,
        selectedMood === item && styles.selectedMood
      ]}
      onPress={() => setSelectedMood(item)}
    >
      <Ionicons
        name={
          item === 'struggling' ? 'sad-outline' :
          item === 'neutral' ? 'happy-outline' :
          'thumbs-up-outline'
        }
        size={20}
        color={selectedMood === item ? '#FFFFFF' : '#666666'}
      />
      <Text style={[
        styles.moodText,
        selectedMood === item && styles.selectedMoodText
      ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderVoiceClip = ({ item }: { item: VoiceClip }) => {
    if (!isPremium && item.isPremium) {
      return (
        <View style={styles.lockedClipContainer}>
          <Text style={styles.lockedClipTitle}>{item.title}</Text>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={16} color="#FFD700" />
            <Text style={styles.lockedText}>Premium</Text>
          </View>
        </View>
      );
    }

    return <VoicePlayer clip={item} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voice Library</Text>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Category</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        <Text style={styles.filterLabel}>Mood</Text>
        <FlatList
          data={moods}
          renderItem={renderMoodItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodsList}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={voiceClips}
          renderItem={renderVoiceClip}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.clipsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No voice clips found for this selection</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 24,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#666666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  moodsList: {
    paddingVertical: 8,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  selectedMood: {
    backgroundColor: '#4CAF50',
  },
  moodText: {
    color: '#666666',
    fontWeight: '500',
    marginLeft: 4,
  },
  selectedMoodText: {
    color: '#FFFFFF',
  },
  clipsList: {
    paddingBottom: 16,
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 32,
    fontSize: 16,
  },
  lockedClipContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    opacity: 0.7,
  },
  lockedClipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  lockedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LibraryScreen;
