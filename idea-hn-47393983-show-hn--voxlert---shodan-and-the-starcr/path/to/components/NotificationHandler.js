import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { processNotification } from '../services/notificationService';
import { generateContextualAudioDescription } from '../services/contextService';
import VoicePlayer from './VoicePlayer';

const NotificationHandler = ({ selectedVoice }) => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(handleNotification);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleNotification = (notification) => {
    const processed = processNotification({
      app: notification.request.content.data?.app || 'Unknown',
      title: notification.request.content.title,
      body: notification.request.content.body
    });

    const audioDescription = generateContextualAudioDescription(
      processed.original,
      selectedVoice
    );

    setCurrentNotification({
      ...processed,
      audioDescription
    });

    // Play the audio automatically
    setIsPlaying(true);
  };

  return (
    <View style={styles.container}>
      {currentNotification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.appName}>{currentNotification.original.app}</Text>
          <Text style={styles.narrative}>{currentNotification.narrative}</Text>
          <VoicePlayer
            text={currentNotification.audioDescription.text}
            voice={currentNotification.audioDescription.voice}
            isPlaying={isPlaying}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
              }
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notificationContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  appName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  narrative: {
    color: '#fff',
    marginBottom: 10,
  },
});

export default NotificationHandler;
