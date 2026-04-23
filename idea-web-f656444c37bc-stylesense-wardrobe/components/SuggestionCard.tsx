import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { addWearLogEntry } from '@/lib/database';
import { WardrobeItem, OutfitSuggestion } from '@/types';

const { width } = Dimensions.get('window');

interface SuggestionCardProps {
  suggestion: OutfitSuggestion;
  onRefresh: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onRefresh }) => {
  const { items: allItems } = useWardrobeStore();
  const [outfitItems, setOutfitItems] = useState<WardrobeItem[]>([]);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const items = allItems.filter(item => suggestion.items.includes(item.id));
    setOutfitItems(items);
  }, [suggestion, allItems]);

  const handleAccept = async () => {
    try {
      // Log the outfit to wear_log
      await addWearLogEntry({
        itemIds: suggestion.items,
        wornDate: new Date().toISOString(),
        weather: suggestion.context.weather,
        event: suggestion.context.events.join(', ')
      });

      // Update local state
      setIsAccepted(true);

      // Refresh suggestions after a delay
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error) {
      console.error('Error accepting outfit:', error);
    }
  };

  const handleReject = () => {
    // Just refresh suggestions
    onRefresh();
  };

  if (isAccepted) {
    return (
      <View style={styles.acceptedContainer}>
        <Text style={styles.acceptedText}>✅ Outfit accepted!</Text>
        <Text style={styles.acceptedSubtext}>You'll see new suggestions tomorrow</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.itemsContainer}>
        {outfitItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image
              source={{ uri: item.imageUri }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.colorPalette}>
              {item.colors.map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorDot, { backgroundColor: color }]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
        >
          <Text style={styles.buttonText}>✕ Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={handleAccept}
        >
          <Text style={styles.buttonText}>✓ Wear This</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  itemContainer: {
    margin: 4,
    width: (width - 64) / 3,
    aspectRatio: 0.7,
  },
  itemImage: {
    width: '100%',
    height: '80%',
    borderRadius: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  acceptedContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  acceptedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  acceptedSubtext: {
    fontSize: 14,
    color: '#388E3C',
  },
});

export default SuggestionCard;
