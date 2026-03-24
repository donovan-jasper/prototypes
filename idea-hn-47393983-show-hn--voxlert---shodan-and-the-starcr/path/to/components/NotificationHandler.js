import React, { useEffect, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { processNotification } from '../services/notificationService';
import { playNarration } from '../services/audioService';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationHandler = ({ activeVoice }) => {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Request notification permissions
    registerForPushNotificationsAsync();

    // Add notification received listener
    notificationListener.current = Notifications.addNotificationReceivedListener(handleNotification);

    // Add notification response listener (when user interacts with notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification Response:', response);
      }
    );

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'VoiceVerse needs notification permissions to read your notifications aloud.'
        );
        return;
      }

      // Get device token for push notifications (if needed)
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  const handleNotification = async (rawNotification) => {
    try {
      // Process the notification through our service
      const processedNotification = processNotification(rawNotification);
      
      console.log('Processed notification:', processedNotification);
      
      // Play the narration using the selected voice
      await playNarration(processedNotification.processed.narrative, activeVoice);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  return (
    <View style={{ position: 'absolute', top: -1000, left: -1000 }}>
      {/* Invisible component that handles notifications */}
    </View>
  );
};

export default NotificationHandler;
