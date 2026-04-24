import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { generateOutfit } from '../utils/outfitGenerator';
import { useNavigation } from '@react-navigation/native';

const OutfitGeneratorScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleGenerateOutfits = async (occasion) => {
    setIsLoading(true);
    try {
      const generatedOutfits = await generateOutfit(occasion);
      setOutfits(generatedOutfits);
    } catch (error) {
      console.error('Error generating outfits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryOn = (outfit) => {
    navigation.navigate('ARTryOn', { outfit });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.workButton]}
          onPress={() => handleGenerateOutfits('work')}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Work Outfits</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.casualButton]}
          onPress={() => handleGenerateOutfits('casual')}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Casual Outfits</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating outfits...</Text>
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.outfit}>
              <Text style={styles.occasionText}>{item.occasion.toUpperCase()}</Text>
              <Text style={styles.itemText}>Top: {item.top}</Text>
              <Text style={styles.itemText}>Bottom: {item.bottom}</Text>
              <Text style={styles.itemText}>Accessory: {item.accessory}</Text>
              <TouchableOpacity
                style={styles.tryOnButton}
                onPress={() => handleTryOn(item)}
              >
                <Text style={styles.tryOnButtonText}>Try On</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No outfits generated yet. Select an occasion to get started!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  workButton: {
    backgroundColor: '#3498db',
  },
  casualButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  outfit: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  occasionText: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  tryOnButton: {
    marginTop: 10,
    backgroundColor: '#9b59b6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  tryOnButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default OutfitGeneratorScreen;
