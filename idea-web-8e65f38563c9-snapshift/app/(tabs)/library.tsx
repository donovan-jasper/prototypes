import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { getVoiceClipsByCategory, getClipsByCategoryAndMood, getPremiumClips } from '../../services/voiceLibrary';
import VoicePlayer from '../../components/VoicePlayer';
import { VoiceClip } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const categories = ['all', 'morning', 'focus', 'energy', 'calm', 'celebrate'];
const moods = ['struggling', 'neutral', 'crushing'];

const LibraryScreen = () => {
  const { isPremium, purchaseSubscription } = useContext(SubscriptionContext);
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

  const handlePurchase = async (isAnnual: boolean = false) => {
    const success = await purchaseSubscription(isAnnual);
    if (success) {
      setShowPaywall(false);
    }
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
            <Text style={styles.modalTitle}>Unlock Full Library</Text>

            <View style={styles.featureComparison}>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>Free</Text>
                <Text style={styles.featureText}>Premium</Text>
              </View>

              <View style={styles.featureRow}>
                <Text style={styles.featureText}>10 rotating clips</Text>
                <Text style={styles.featureText}>50+ clips</Text>
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
              onPress={() => handlePurchase(false)}
            >
              <Text style={styles.purchaseButtonText}>Upgrade to Premium - $7.99/month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.annualButton}
              onPress={() => handlePurchase(true)}
            >
              <Text style={styles.annualButtonText}>Annual Plan - $59.99/year</Text>
              <Text style={styles.annualDiscount}>Save 37%</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  premiumBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
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
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    alignItems: 'center',
  },
  selectedMoodButton: {
    backgroundColor: '#4CAF50',
  },
  moodButtonText: {
    color: '#333',
  },
  selectedMoodButtonText: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  featureText: {
    fontSize: 16,
  },
  purchaseButton: {
    backgroundColor: '#673ab7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  annualButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  annualButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  annualDiscount: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFD700',
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default LibraryScreen;
