import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const EventScreen = () => {
  const route = useRoute();
  const { user } = route.params;
  const [eventType, setEventType] = useState('virtual');

  const handleSchedule = () => {
    // Schedule event in Firebase
    alert(`Scheduled ${eventType} event with ${user.name}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Event with {user.name}</Text>
      <Button title="Virtual" onPress={() => setEventType('virtual')} />
      <Button title="In-Person" onPress={() => setEventType('in-person')} />
      <Button title="Schedule" onPress={handleSchedule} />
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
    marginBottom: 20,
  },
});

export default EventScreen;
