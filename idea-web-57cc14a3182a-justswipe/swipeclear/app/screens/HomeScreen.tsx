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
          onSwipeLeft={() => handleSwipeLeft(item)}
          onSwipeRight={() => handleSwipeRight(item)}
          onSwipeUp={() => handleSwipeUp(item)}
          onSwipeDown={() => handleSwipeDown(item)}
        >
          <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemApp, { color: item.pinned ? '#FF6B6B' : '#6C757D' }]}>
                {item.app}
              </Text>
              <Text style={styles.itemTime}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemBody}>{item.body}</Text>
            <View style={styles.itemStatus}>
              {item.pinned && (
                <View style={styles.statusBadge}>
                  <Ionicons name="pin" size={12} color="#FF6B6B" />
                  <Text style={styles.statusText}>Pinned</Text>
                </View>
              )}
              {item.muted && (
                <View style={styles.statusBadge}>
                  <Ionicons name="volume-mute" size={12} color="#6C757D" />
                  <Text style={styles.statusText}>Muted</Text>
                </View>
              )}
            </View>
          </View>
        </SwipeAction>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SwipeClear</Text>
        <TouchableOpacity onPress={() => setShowArchived(!showArchived)}>
          <Ionicons
            name={showArchived ? 'archive' : 'archive-outline'}
            size={24}
            color="#6C757D"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#6C757D" />
            <Text style={styles.emptyText}>
              {showArchived ? 'No archived notifications' : 'No new notifications'}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  listContent: {
    paddingBottom: 80,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemApp: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemTime: {
    fontSize: 12,
    color: '#6C757D',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  itemBody: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  itemStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#495057',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
