import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { generateOutfit } from '../utils/outfitGenerator';
import { getWardrobeItems } from '../services/wardrobeService';

const OutfitGeneratorScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState('work');
  const [wardrobe, setWardrobe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const occasions = [
    { id: 'work', title: 'Work' },
    { id: 'casual', title: 'Casual' },
    { id: 'formal', title: 'Formal' },
    { id: 'athleisure', title: 'Athleisure' }
  ];

  useEffect(() => {
    const loadWardrobe = async () => {
      try {
        const items = await getWardrobeItems();
        const categorizedWardrobe = categorizeWardrobe(items);
        setWardrobe(categorizedWardrobe);
      } catch (error) {
        console.error('Error loading wardrobe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWardrobe();
  }, []);

  const categorizeWardrobe = (items) => {
    const categorized = {
      shirts: [],
      blouses: [],
      'button-ups': [],
      pants: [],
      trousers: [],
      slacks: [],
      jackets: [],
      blazers: [],
      cardigans: [],
      't-shirts': [],
      hoodies: [],
      sweaters: [],
      jeans: [],
      shorts: [],
      leggings: [],
      sneakers: [],
      boots: [],
      sandals: [],
      dresses: [],
      skirts: []
    };

    items.forEach(item => {
      if (item.category in categorized) {
        categorized[item.category].push(item.name);
      }
    });

    return categorized;
  };

  const handleGenerateOutfits = () => {
    if (!wardrobe) return;

    const generatedOutfits = generateOutfit(wardrobe, selectedOccasion);
    setOutfits(generatedOutfits);
  };

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitCard}>
      <Text style={styles.outfitTitle}>Outfit for {item.occasion}</Text>
      <Text style={styles.outfitItem}>Top: {item.top}</Text>
      <Text style={styles.outfitItem}>Bottom: {item.bottom}</Text>
      <Text style={styles.outfitItem}>Accessory: {item.accessory}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading your wardrobe...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Outfit Generator</Text>

      <View style={styles.occasionSelector}>
        {occasions.map(occasion => (
          <TouchableOpacity
            key={occasion.id}
            style={[
              styles.occasionButton,
              selectedOccasion === occasion.id && styles.selectedOccasion
            ]}
            onPress={() => setSelectedOccasion(occasion.id)}
          >
            <Text style={[
              styles.occasionText,
              selectedOccasion === occasion.id && styles.selectedOccasionText
            ]}>{occasion.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateOutfits}
        disabled={!wardrobe || wardrobe.shirts.length === 0}
      >
        <Text style={styles.generateButtonText}>Generate Outfits</Text>
      </TouchableOpacity>

      {outfits.length === 0 && wardrobe && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {wardrobe.shirts.length === 0
              ? 'Please add some items to your wardrobe first'
              : 'Select an occasion and tap "Generate Outfits"'}
          </Text>
        </View>
      )}

      <FlatList
        data={outfits}
        renderItem={renderOutfit}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.outfitsList}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  occasionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  occasionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  selectedOccasion: {
    backgroundColor: '#6200ee',
  },
  occasionText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedOccasionText: {
    color: 'white',
  },
  generateButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outfitsList: {
    paddingBottom: 20,
  },
  outfitCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  outfitItem: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default OutfitGeneratorScreen;
