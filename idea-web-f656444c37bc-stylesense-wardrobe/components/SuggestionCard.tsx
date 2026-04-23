import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { OutfitSuggestion, WardrobeItem } from '@/types';
import { getItemById, updateItem, addWearLogEntry } from '@/lib/database';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.3 * width;

interface SuggestionCardProps {
  suggestion: OutfitSuggestion;
  onRefresh: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onRefresh }) => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pan] = useState(new Animated.ValueXY());
  const [opacity] = useState(new Animated.Value(1));

  // Load item details when component mounts
  React.useEffect(() => {
    async function loadItems() {
      try {
        const loadedItems = await Promise.all(
          suggestion.items.map(itemId => getItemById(itemId))
        );
        setItems(loadedItems.filter(item => item !== null) as WardrobeItem[]);
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadItems();
  }, [suggestion.items]);

  // Handle swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      pan.setValue({ x: gestureState.dx, y: 0 });
    },
    onPanResponderRelease: async (_, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        // Swiped right (accept)
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(async () => {
          try {
            // Update wear count for each item
            for (const itemId of suggestion.items) {
              const item = await getItemById(itemId);
              if (item) {
                await updateItem(itemId, { wearCount: item.wearCount + 1 });
              }
            }

            // Log the outfit as worn
            await addWearLogEntry({
              itemIds: suggestion.items,
              wornDate: new Date().toISOString(),
              weather: suggestion.context.weather,
              event: suggestion.context.events.join(', ')
            });

            // Refresh suggestions
            onRefresh();
          } catch (error) {
            console.error('Error accepting outfit:', error);
          }
        });
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        // Swiped left (reject)
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(onRefresh);
      } else {
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text>Loading outfit...</Text>
      </View>
    );
  }

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { rotate },
    ],
    opacity,
  };

  return (
    <Animated.View
      style={[styles.card, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image
              source={{ uri: item.imageUri }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <View style={styles.colorDots}>
                {item.colors.map((color, index) => (
                  <View
                    key={index}
                    style={[styles.colorDot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.scoreText}>Match Score: {Math.round(suggestion.score * 100)}%</Text>
        <Text style={styles.contextText}>
          {suggestion.context.weather} • {suggestion.context.events.join(', ')}
        </Text>
      </View>

      <View style={styles.swipeIndicators}>
        <Text style={[styles.swipeText, styles.rejectText]}>Reject</Text>
        <Text style={[styles.swipeText, styles.acceptText]}>Accept</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  itemContainer: {
    width: (width - 80) / 2,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    aspectRatio: 0.75,
  },
  itemInfo: {
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  colorDots: {
    flexDirection: 'row',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 4,
  },
  contextText: {
    fontSize: 12,
    color: '#64748b',
  },
  swipeIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'none',
  },
  swipeText: {
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.2,
  },
  rejectText: {
    color: '#ef4444',
  },
  acceptText: {
    color: '#10b981',
  },
});

export default SuggestionCard;
