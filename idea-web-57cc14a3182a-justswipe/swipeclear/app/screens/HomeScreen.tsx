import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import SwipeAction from '../components/SwipeAction';
import QuickAccessBar from '../components/QuickAccessBar';
import { initDB, getItems, updateItem, insertNotification, deleteNotification } from '../utils/db';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HomeScreen = () => {
  const [items, setItems] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [animatingItems, setAnimatingItems] = useState({});
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    initDB().then(() => {
      requestPermissions();
      loadItems();
    });
  }, []);

  const requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus === 'granted') {
      syncNotifications();
    } else {
      Alert.alert(
        'Permissions Required',
        'SwipeClear needs notification access to display and manage your notifications.',
        [{ text: 'OK' }]
      );
    }
  };

  const syncNotifications = async () => {
    try {
      const presentedNotifications = await Notifications.getPresentedNotificationsAsync();

      for (const notification of presentedNotifications) {
        const notificationData = {
          id: notification.request.identifier,
          title: notification.request.content.title || 'Notification',
          body: notification.request.content.body || '',
          app: notification.request.content.data?.app || 'Unknown App',
          timestamp: notification.date,
        };

        await insertNotification(notificationData);
      }

      loadItems();
    } catch (error) {
      console.error('Error syncing notifications:', error);
    }
  };

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

  const handleSwipeLeft = async (item) => {
    animateAndUpdate(item, { archived: true });

    try {
      await Notifications.dismissNotificationAsync(item.id);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleSwipeRight = (item) => {
    const updatedItem = { ...item, muted: !item.muted };
    updateItem(updatedItem).then(loadItems);
  };

  const handleSwipeUp = (item) => {
    const updatedItem = { ...item, pinned: !item.pinned };
    updateItem(updatedItem).then(loadItems);
  };

  const handleSwipeDown = async (item) => {
    animateAndUpdate(item, { deleted: true });

    try {
      await Notifications.dismissNotificationAsync(item.id);
      await deleteNotification(item.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const quickAccessItems = [
    { name: 'Refresh', icon: 'refresh-outline' },
    { name: 'Notifications', icon: 'notifications-outline' },
  ];

  const handleQuickAccessPress = (item) => {
    if (item.name === 'Refresh') {
      syncNotifications();
    } else if (item.name === 'Notifications') {
      setShowArchived(!showArchived);
    }
  };

  const filteredItems = items.filter(item => {
    if (showArchived) {
      return item.archived && !item.deleted;
    }
    return !item.archived && !item.deleted;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp - a.timestamp;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => {
    const fadeAnim = animatingItems[item.id] || new Animated.Value(1);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <SwipeAction
          item={item}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeUp={handleSwipeUp}
          onSwipeDown={handleSwipeDown}
        >
          <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={[styles.appName, item.pinned && styles.pinned]}>{item.app}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            {item.muted && (
              <View style={styles.mutedBadge}>
                <Text style={styles.mutedText}>Muted</Text>
              </View>
            )}
          </View>
        </SwipeAction>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SwipeClear</Text>
        <TouchableOpacity onPress={() => setShowArchived(!showArchived)}>
          <Ionicons
            name={showArchived ? 'archive' : 'archive-outline'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showArchived ? 'No archived items' : 'No new notifications'}
            </Text>
          </View>
        }
      />

      <QuickAccessBar
        items={quickAccessItems}
        onPress={handleQuickAccessPress}
      />
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingBottom: 80,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pinned: {
    color: '#ff6b6b',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
  },
  mutedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffcccc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mutedText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;
