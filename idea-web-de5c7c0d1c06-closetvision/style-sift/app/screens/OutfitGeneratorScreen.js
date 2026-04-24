import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { generateOutfit } from '../utils/outfitGenerator';

const OutfitGeneratorScreen = () => {
  const [outfits, setOutfits] = useState([]);

  const handleGenerateOutfits = async (occasion) => {
    const generatedOutfits = await generateOutfit(occasion);
    setOutfits(generatedOutfits);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleGenerateOutfits('work')}
        >
          <Text style={styles.buttonText}>Work Outfits</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleGenerateOutfits('casual')}
        >
          <Text style={styles.buttonText}>Casual Outfits</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.outfit}>
            <Text>{item.top}</Text>
            <Text>{item.bottom}</Text>
            <Text>{item.accessory}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  outfit: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default OutfitGeneratorScreen;
