import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { getVoiceClipsByCategory, getClipsByCategoryAndMood, getPremiumClips } from '../../services/voiceLibrary';
import VoicePlayer from '../../components/VoicePlayer';
import { VoiceClip } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const categories = ['all', 'morning', 'focus', 'energy', 'calm', 'celebrate'];
const moods = ['struggling', 'neutral', 'crushing'];

const LibraryScreen = () => {
  const { isPremium } = useSubscription();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceClips, setVoiceClips] = useState<VoiceClip[]>([]);
  const [premiumCount, setPremiumCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadVoiceClips();
  }, [selectedCategory, selectedMood, searchQuery, isPremium]);

  const loadVoiceClips = () => {
    let clips = getClipsByCategoryAndMood(selectedCategory, selectedMood);

    if (searchQuery) {
      clips = clips.filter(clip =>
        clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const premiumClips = getPremiumClips();
    setPremiumCount(premiumClips.length);

    setVoiceClips(clips);
  };

  const handleUpgradePress = () => {
    if (!isPremium) {
      setShowPaywall(true);
    }
  };

  const handlePurchase = async () => {
    // In a real app, you would call the purchase function from your subscription service
    // For this prototype, we'll just simulate a successful purchase
    setTimeout(() => {
      setShowPaywall(false);
      // In a real app, you would update the subscription status here
    }, 1000);
  };

  const handleNavigateToSettings = () => {
    setShowPaywall(false);
    navigation.navigate('settings');
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
      <View style={styles.header}>
        <Text style={styles.title}>Voice Library</Text>
        {!isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="lock-closed" size={16} color="#FFD700" />
            <Text style={styles.premiumBadgeText}>{premiumCount} locked</Text>
          </View>
        )}
      </View>

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
            isPremiumUser={isPremium}
            onUpgradePress={handleUpgradePress}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clips found matching your criteria</Text>
          </View>
        }
      />

      <Modal
        visible={showPaywall}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaywall(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unlock Premium Content</Text>

            <View style={styles.featureComparison}>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>Free</Text>
                <Text style={styles.featureText}>Premium</Text>
              </View>

              <View style={styles.featureRow}>
                <Text style={styles.featureText}>10 rotating clips</Text>
                <Text style={styles.featureText}>Full library</Text>
              </View>

              <View style={styles.featureRow}>
                <Text style={styles.featureText}>Basic scheduling</Text>
                <Text style={styles.featureText}>Advanced scheduling</Text>
              </View>

              <View style={styles.featureRow}>
                <Text style={styles.featureText}>Standard prompts</Text>
                <Text style={styles.featureText}>Personalized TTS</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
            >
              <Text style={styles.purchaseButtonText}>Upgrade to Premium - $7.99/month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleNavigateToSettings}
            >
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#673ab7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
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
    marginBottom: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  selectedCategoryButton: {
    backgroundColor: '#673ab7',
  },
  categoryButtonText: {
    color: '#333',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedMoodButton: {
    backgroundColor: '#673ab7',
  },
  moodButtonText: {
    color: '#333',
  },
  selectedMoodButtonText: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureComparison: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
  },
  purchaseButton: {
    backgroundColor: '#673ab7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    padding: 12,
  },
  closeButtonText: {
    color: '#673ab7',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LibraryScreen;
