import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { setupNotificationListener, requestNotificationPermissions } from '../services/notificationService';

const NotificationHandler = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          setupNotificationListener();
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notification handler active</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 10,
    opacity: 0.5
  },
  text: {
    color: 'gray',
    fontSize: 12,
    textAlign: 'center'
  }
});

export default NotificationHandler;
