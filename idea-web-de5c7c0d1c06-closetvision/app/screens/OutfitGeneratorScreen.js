import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { generateOutfit } from '../utils/outfitGenerator';

const OutfitGeneratorScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState('work');

  const occasions = [
    { id: 'work', title: 'Work' },
    { id: 'casual', title: 'Casual' }
  ];

  const handleGenerateOutfits = () => {
    const mockWardrobe = {
      shirts: ['Oxford shirt', 'Polo shirt'],
      pants: ['Chinos', 'Dress pants'],
      jackets: ['Wool jacket', 'Leather jacket']
    };

    const generatedOutfits = generateOutfit(mockWardrobe, selectedOccasion);
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
            <Text style={styles.occasionText}>{occasion.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.generateButton} onPress={handleGenerateOutfits}>
        <Text style={styles.generateButtonText}>Generate Outfits</Text>
      </TouchableOpacity>

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
  },
  occasionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  occasionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  selectedOccasion: {
    backgroundColor: '#6200ee',
  },
  occasionText: {
    color: '#333',
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
  },
  outfitItem: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default OutfitGeneratorScreen;
