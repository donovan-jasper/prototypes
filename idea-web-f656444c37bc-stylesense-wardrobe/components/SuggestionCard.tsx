import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { addWearLogEntry } from '@/lib/database';
import { WardrobeItem, OutfitSuggestion } from '@/types';

const { width } = Dimensions.get('window');

interface SuggestionCardProps {
  suggestion: OutfitSuggestion;
  onAccepted: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onAccepted }) => {
  const { items: allItems } = useWardrobeStore();
  const [outfitItems, setOutfitItems] = useState<WardrobeItem[]>([]);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [pan] = useState(new Animated.ValueXY());

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

      // Notify parent component
      onAccepted();
    } catch (error) {
      console.error('Error accepting outfit:', error);
    }
  };

  const handleReject = () => {
    setIsRejected(true);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y }
    ], { useNativeDriver: false }),
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dx > 120) {
        handleAccept();
      } else if (gestureState.dx < -120) {
        handleReject();
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
      }
    }
  });

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  const opacity = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp'
  });

  if (isAccepted) {
    return (
      <View style={styles.acceptedContainer}>
        <Text style={styles.acceptedText}>✅ Outfit accepted!</Text>
        <Text style={styles.acceptedSubtext}>You'll see new suggestions tomorrow</Text>
      </View>
    );
  }

  if (isRejected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
          opacity
        }
      ]}
      {...panResponder.panHandlers}
    >
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
    </Animated.View>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptedContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  acceptedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  acceptedSubtext: {
    fontSize: 14,
    color: '#4caf50',
  },
});

export default SuggestionCard;
