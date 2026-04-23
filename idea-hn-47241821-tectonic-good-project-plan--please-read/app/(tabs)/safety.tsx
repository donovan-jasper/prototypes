import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { scheduleSafetyCheckIn, retryOfflineMessages } from '../../services/sms';
import { getCurrentLocation } from '../../services/location';
import { initDatabase } from '../../services/database';

interface TrustedContact {
  id: string;
  phoneNumber: string;
  name: string;
}

interface SafetyCheckIn {
  id: string;
  timerDuration: number;
  message: string;
  contacts: TrustedContact[];
  createdAt: Date;
}

export default function SafetyCheckInScreen() {
  const navigation = useNavigation();
  const [timerDuration, setTimerDuration] = useState(60); // Default 1 hour
  const [message, setMessage] = useState('I haven\'t checked in. Please help me.');
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    loadContacts();
    checkActiveCheckIn();
    setupNotifications();

    // Set up interval to check for active check-ins
    const interval = setInterval(() => {
      checkActiveCheckIn();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const setupNotifications = async () => {
    await Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  const loadContacts = async () => {
    try {
      const db = await initDatabase();
      const result = await db.getAllAsync<{ id: string; name: string; phone: string }>(
        'SELECT id, name, phone FROM trusted_contacts'
      );
      setContacts(result.map(contact => ({
        id: contact.id,
        name: contact.name,
        phoneNumber: contact.phone
      })));
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const checkActiveCheckIn = async () => {
    try {
      const db = await initDatabase();
      const activeCheckIn = await db.getFirstAsync<{
        id: string;
        timer_duration: number;
        message: string;
        contacts: string;
        created_at: string;
      }>(
        'SELECT * FROM check_ins ORDER BY created_at DESC LIMIT 1'
      );

      if (activeCheckIn) {
        const createdAt = new Date(activeCheckIn.created_at);
        const elapsedTime = (Date.now() - createdAt.getTime()) / 1000 / 60; // in minutes
        const remaining = activeCheckIn.timer_duration - elapsedTime;

        if (remaining > 0) {
          setIsActive(true);
          setRemainingTime(Math.floor(remaining));
          setTimerDuration(activeCheckIn.timer_duration);
          setMessage(activeCheckIn.message);
          setContacts(JSON.parse(activeCheckIn.contacts));
        } else {
          setIsActive(false);
          setRemainingTime(0);
        }
      } else {
        setIsActive(false);
        setRemainingTime(0);
      }
    } catch (error) {
      console.error('Error checking active check-in:', error);
    }
  };

  const addContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    try {
      const db = await initDatabase();
      const id = Date.now().toString();
      await db.runAsync(
        'INSERT INTO trusted_contacts (id, name, phone) VALUES (?, ?, ?)',
        [id, newContactName.trim(), newContactPhone.trim()]
      );

      setContacts([...contacts, {
        id,
        name: newContactName.trim(),
        phoneNumber: newContactPhone.trim()
      }]);
      setNewContactName('');
      setNewContactPhone('');
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const removeContact = async (id: string) => {
    try {
      const db = await initDatabase();
      await db.runAsync('DELETE FROM trusted_contacts WHERE id = ?', [id]);
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Error removing contact:', error);
      Alert.alert('Error', 'Failed to remove contact');
    }
  };

  const startCheckIn = async () => {
    if (contacts.length === 0) {
      Alert.alert('Error', 'Please add at least one trusted contact');
      return;
    }

    try {
      const checkIn: SafetyCheckIn = {
        id: Date.now().toString(),
        timerDuration,
        message,
        contacts,
        createdAt: new Date()
      };

      await scheduleSafetyCheckIn(checkIn);
      setIsActive(true);
      setRemainingTime(timerDuration);

      Alert.alert('Success', 'Safety check-in started successfully');
    } catch (error) {
      console.error('Error starting check-in:', error);
      Alert.alert('Error', 'Failed to start safety check-in');
    }
  };

  const manualCheckIn = async () => {
    try {
      const db = await initDatabase();
      await db.runAsync('DELETE FROM check_ins');

      setIsActive(false);
      setRemainingTime(0);

      Alert.alert('Success', 'You have checked in successfully. Your location will not be shared.');
    } catch (error) {
      console.error('Error manual check-in:', error);
      Alert.alert('Error', 'Failed to complete manual check-in');
    }
  };

  const retryMessages = async () => {
    try {
      await retryOfflineMessages();
      Alert.alert('Success', 'Offline messages have been retried');
    } catch (error) {
      console.error('Error retrying messages:', error);
      Alert.alert('Error', 'Failed to retry offline messages');
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Check-In</Text>

      {isActive ? (
        <View style={styles.activeContainer}>
          <Text style={styles.activeTitle}>Check-In Active</Text>
          <Text style={styles.timerText}>
            {formatTime(remainingTime)}
          </Text>
          <Text style={styles.messageText}>{message}</Text>

          <TouchableOpacity
            style={styles.checkInButton}
            onPress={manualCheckIn}
          >
            <Text style={styles.checkInButtonText}>I'm Safe - Check In Now</Text>
          </TouchableOpacity>

          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.contactItem}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                </View>
              )}
            />
          </View>
        </View>
      ) : (
        <View style={styles.setupContainer}>
          <Text style={styles.sectionTitle}>Timer Duration</Text>
          <View style={styles.timerOptions}>
            {[15, 30, 60, 120, 240].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.timerOption,
                  timerDuration === duration && styles.selectedTimerOption
                ]}
                onPress={() => setTimerDuration(duration)}
              >
                <Text style={styles.timerOptionText}>{formatTime(duration)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Message to Contacts</Text>
          <TextInput
            style={styles.messageInput}
            multiline
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your message"
          />

          <Text style={styles.sectionTitle}>Trusted Contacts</Text>
          <View style={styles.addContactContainer}>
            <TextInput
              style={styles.contactInput}
              placeholder="Name"
              value={newContactName}
              onChangeText={setNewContactName}
            />
            <TextInput
              style={styles.contactInput}
              placeholder="Phone Number"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addContact}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.contactItem}>
                <View>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeContact(item.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.startButton}
            onPress={startCheckIn}
          >
            <Text style={styles.startButtonText}>Start Safety Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={retryMessages}
          >
            <Text style={styles.retryButtonText}>Retry Offline Messages</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  activeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2ecc71',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  checkInButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  checkInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactsSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  setupContainer: {
    flex: 1,
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timerOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
  },
  selectedTimerOption: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  timerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  addContactContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  contactInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  startButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
