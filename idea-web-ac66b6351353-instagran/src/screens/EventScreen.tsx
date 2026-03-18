import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type EventScreenRouteProp = RouteProp<RootStackParamList, 'EventScreen'>;
type EventScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventScreen'>;

type Props = {
  route: EventScreenRouteProp;
  navigation: EventScreenNavigationProp;
};

const EventScreen = ({ route, navigation }: Props) => {
  const { user } = route.params;
  const [eventType, setEventType] = useState<'virtual' | 'in-person'>('virtual');

  const handleSchedule = () => {
    Alert.alert(
      'Event Scheduled',
      `You've scheduled a ${eventType} event with ${user.name}!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MatchScreen'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Event with {user.name}</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.label}>Shared Interests:</Text>
        <Text style={styles.hobbies}>{user.hobbies.join(', ')}</Text>
      </View>

      <Text style={styles.sectionTitle}>Choose Event Type:</Text>
      
      <TouchableOpacity
        style={[styles.optionButton, eventType === 'virtual' && styles.optionButtonSelected]}
        onPress={() => setEventType('virtual')}
      >
        <Text style={[styles.optionText, eventType === 'virtual' && styles.optionTextSelected]}>
          Virtual Meetup
        </Text>
        <Text style={styles.optionDescription}>Video chat from anywhere</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, eventType === 'in-person' && styles.optionButtonSelected]}
        onPress={() => setEventType('in-person')}
      >
        <Text style={[styles.optionText, eventType === 'in-person' && styles.optionTextSelected]}>
          In-Person Meetup
        </Text>
        <Text style={styles.optionDescription}>Meet at a local venue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
        <Text style={styles.scheduleButtonText}>Schedule Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  hobbies: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EventScreen;
