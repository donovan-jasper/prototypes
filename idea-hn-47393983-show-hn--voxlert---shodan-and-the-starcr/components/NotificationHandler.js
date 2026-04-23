import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { processNotification } from '../services/notificationService';
import { generateNarrativeText } from '../services/contextService';
import { playNarration } from '../services/audioService';

const NotificationHandler = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }

        // Set notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });

        // Listen for incoming notifications
        const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
          try {
            // Process the notification
            const processed = processNotification(notification);
            if (processed) {
              // Generate narrative text
              const narrative = generateNarrativeText(processed);
              // Play the narration
              await playNarration(narrative, processed.characterVoice || 'default');
            }
          } catch (error) {
            console.error('Error handling notification:', error);
          }
        });

        return () => {
          if (subscription) {
            Notifications.removeNotificationSubscription(subscription);
          }
        };
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
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
