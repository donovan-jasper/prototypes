import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { joinEvent } from '../utils/eventService';
import { useAuth } from '../hooks/useAuth';

const EventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const { userId } = useAuth();

  const handleJoinEvent = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please wait while we set up your account');
      return;
    }

    try {
      await joinEvent(event.id, userId);
      navigation.navigate('Chat', { event });
    } catch (error) {
      Alert.alert('Error', 'Failed to join event. Please try again.');
      console.error('Error joining event:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>
      <Button title="Quick Join" onPress={handleJoinEvent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default EventScreen;
