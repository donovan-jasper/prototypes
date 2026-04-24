import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { generateOutfit } from '../utils/outfitGenerator';
import { getWardrobeItems } from '../services/wardrobeService';

const OutfitGeneratorScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState('work');
  const [wardrobe, setWardrobe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const occasions = [
    { id: 'work', title: 'Work', icon: require('../../assets/icons/work.png') },
    { id: 'casual', title: 'Casual', icon: require('../../assets/icons/casual.png') },
    { id: 'formal', title: 'Formal', icon: require('../../assets/icons/formal.png') },
    { id: 'athleisure', title: 'Athleisure', icon: require('../../assets/icons/athleisure.png') }
  ];

  useEffect(() => {
    const loadWardrobe = async () => {
      try {
        const items = await getWardrobeItems();
        const categorizedWardrobe = categorizeWardrobe(items);
        setWardrobe(categorizedWardrobe);
        setError(null);
      } catch (error) {
        console.error('Error loading wardrobe:', error);
        setError('Failed to load wardrobe. Please try again.');
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
      skirts: [],
      ties: []
    };

    items.forEach(item => {
      if (item.category in categorized) {
        categorized[item.category].push(item.name);
      }
    });

    return categorized;
  };

  const handleGenerateOutfits = () => {
    if (!wardrobe) {
      setError('Wardrobe not loaded. Please try again.');
      return;
    }

    const generatedOutfits = generateOutfit(wardrobe, selectedOccasion);
    if (generatedOutfits.length === 0) {
      setError('Could not generate outfits. Please add more items to your wardrobe.');
    } else {
      setOutfits(generatedOutfits);
      setError(null);
    }
  };

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitCard}>
      <Text style={styles.outfitTitle}>Outfit for {item.occasion}</Text>
      <View style={styles.outfitItemsContainer}>
        <View style={styles.outfitItem}>
          <Text style={styles.itemLabel}>Top:</Text>
          <Text style={styles.itemName}>{item.top}</Text>
        </View>
        <View style={styles.outfitItem}>
          <Text style={styles.itemLabel}>Bottom:</Text>
          <Text style={styles.itemName}>{item.bottom}</Text>
        </View>
        <View style={styles.outfitItem}>
          <Text style={styles.itemLabel}>Accessory:</Text>
          <Text style={styles.itemName}>{item.accessory}</Text>
        </View>
      </View>
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
            <Image source={occasion.icon} style={styles.occasionIcon} />
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
        disabled={!wardrobe || Object.values(wardrobe).every(arr => arr.length === 0)}
      >
        <Text style={styles.generateButtonText}>Generate Outfits</Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {outfits.length === 0 && wardrobe && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {Object.values(wardrobe).every(arr => arr.length === 0)
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
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  selectedOccasion: {
    backgroundColor: '#6200ee',
  },
  occasionIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
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
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  generateButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  outfitsList: {
    paddingBottom: 20,
  },
  outfitCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    color: '#6200ee',
  },
  outfitItemsContainer: {
    marginTop: 10,
  },
  outfitItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemLabel: {
    fontWeight: '600',
    marginRight: 5,
    color: '#555',
  },
  itemName: {
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

export default OutfitGeneratorScreen;
