import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
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
        
        {permissionStatus !== 'granted' && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissions}
          >
            <Ionicons name="warning-outline" size={20} color="#ff9800" />
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.itemsContainer}>
        {sortedItems.map((item) => {
          const fadeAnim = animatingItems[item.id];
          const itemContent = (
            <View style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.appName}>{item.app}</Text>
                <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.body ? <Text style={styles.itemBody}>{item.body}</Text> : null}
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
              {showArchived ? 'No archived notifications' : permissionStatus === 'granted' ? 'No notifications' : 'Grant notification access to get started'}
            </Text>
          </View>
        )}
      </View>

      <QuickAccessBar items={quickAccessItems} onItemPress={handleQuickAccessPress} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4285f4',
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
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff3e0',
  },
  permissionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9800',
  },
  itemsContainer: {
    flex: 1,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    paddingHorizontal: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomeScreen;
