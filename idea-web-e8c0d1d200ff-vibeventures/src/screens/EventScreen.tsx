import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { joinEvent } from '../utils/eventService';

const EventScreen = ({ route, navigation }) => {
  const { event } = route.params;

  const handleJoinEvent = async () => {
    await joinEvent(event.id);
    navigation.navigate('Chat', { event });
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
