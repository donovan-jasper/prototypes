import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwipeAction from '../components/SwipeAction';
import QuickAccessBar from '../components/QuickAccessBar';
import { initDB, getItems, updateItem } from '../utils/db';

const HomeScreen = () => {
  const [items, setItems] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [animatingItems, setAnimatingItems] = useState({});

  useEffect(() => {
    initDB().then(() => {
      loadItems();
    });
  }, []);

  const loadItems = () => {
    getItems().then(setItems);
  };

  const animateAndUpdate = (item, updates) => {
    const fadeAnim = new Animated.Value(1);
    setAnimatingItems(prev => ({ ...prev, [item.id]: fadeAnim }));

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const updatedItem = { ...item, ...updates };
      updateItem(updatedItem).then(() => {
        loadItems();
        setAnimatingItems(prev => {
          const newState = { ...prev };
          delete newState[item.id];
          return newState;
        });
      });
    });
  };

  const handleSwipeLeft = (item) => {
    animateAndUpdate(item, { archived: true });
  };

  const handleSwipeRight = (item) => {
    const updatedItem = { ...item, muted: !item.muted };
    updateItem(updatedItem).then(loadItems);
  };

  const handleSwipeUp = (item) => {
    const updatedItem = { ...item, pinned: !item.pinned };
    updateItem(updatedItem).then(loadItems);
  };

  const handleSwipeDown = (item) => {
    animateAndUpdate(item, { deleted: true });
  };

  const quickAccessItems = [
    { name: 'Messages' },
    { name: 'Notifications' },
    { name: 'Apps' },
  ];

  const filteredItems = items.filter(item => {
    if (showArchived) {
      return item.archived && !item.deleted;
    }
    return !item.archived && !item.deleted;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.filterButton, showArchived && styles.filterButtonActive]}
          onPress={() => setShowArchived(!showArchived)}
        >
          <Ionicons 
            name={showArchived ? "archive" : "archive-outline"} 
            size={20} 
            color={showArchived ? "#fff" : "#4285f4"} 
          />
          <Text style={[styles.filterButtonText, showArchived && styles.filterButtonTextActive]}>
            {showArchived ? 'Archived' : 'Active'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsContainer}>
        {sortedItems.map((item) => {
          const fadeAnim = animatingItems[item.id];
          const itemContent = (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>{item.name}</Text>
                <View style={styles.badges}>
                  {item.pinned && (
                    <View style={[styles.badge, styles.pinnedBadge]}>
                      <Ionicons name="pin" size={12} color="#ffc107" />
                    </View>
                  )}
                  {item.muted && (
                    <View style={[styles.badge, styles.mutedBadge]}>
                      <Ionicons name="volume-mute" size={12} color="#9e9e9e" />
                    </View>
                  )}
                </View>
              </View>
            </View>
          );

          if (fadeAnim) {
            return (
              <Animated.View key={item.id} style={{ opacity: fadeAnim }}>
                {itemContent}
              </Animated.View>
            );
          }

          return (
            <SwipeAction
              key={item.id}
              onSwipeLeft={() => handleSwipeLeft(item)}
              onSwipeRight={() => handleSwipeRight(item)}
              onSwipeUp={() => handleSwipeUp(item)}
              onSwipeDown={() => handleSwipeDown(item)}
            >
              {itemContent}
            </SwipeAction>
          );
        })}
        {sortedItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons 
              name={showArchived ? "archive-outline" : "checkmark-circle-outline"} 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyStateText}>
              {showArchived ? 'No archived items' : 'All clear!'}
            </Text>
          </View>
        )}
      </View>

      <QuickAccessBar items={quickAccessItems} onItemPress={(item) => console.log(item)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4285f4',
    alignSelf: 'flex-start',
  },
  filterButtonActive: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4285f4',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  itemsContainer: {
    flex: 1,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedBadge: {
    backgroundColor: '#fff8e1',
  },
  mutedBadge: {
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    color: '#999',
    fontWeight: '500',
  },
});

export default HomeScreen;
