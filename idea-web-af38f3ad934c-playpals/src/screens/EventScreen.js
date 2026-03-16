import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const EventScreen = ({ route, navigation }) => {
  const { event } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.location}>{event.location}</Text>
      <Text style={styles.time}>{event.time}</Text>
      <Text style={styles.description}>{event.description}</Text>
      <Button
        title="Join Event"
        onPress={() => {
          // Handle join event logic
          alert('Joined the event!');
        }}
      />
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
  location: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  time: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default EventScreen;
