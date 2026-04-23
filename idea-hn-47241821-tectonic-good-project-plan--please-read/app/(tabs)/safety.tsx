import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Switch, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { scheduleSafetyCheckIn, cancelSafetyCheckIn } from '../../services/sms';
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
  const [customDuration, setCustomDuration] = useState('');

  useEffect(() => {
    loadContacts();
    checkActiveCheckIn();
    setupNotifications();

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
      await cancelSafetyCheckIn();
      setIsActive(false);
      setRemainingTime(0);
      Alert.alert('Success', 'You have manually checked in. The timer has been canceled.');
    } catch (error) {
      console.error('Error with manual check-in:', error);
      Alert.alert('Error', 'Failed to process manual check-in');
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const setCustomTimer = () => {
    const duration = parseInt(customDuration);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Please enter a valid number of minutes');
      return;
    }
    setTimerDuration(duration);
    setCustomDuration('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Check-In Timer</Text>

        {!isActive ? (
          <>
            <View style={styles.timerOptions}>
              <TouchableOpacity
                style={[styles.timerButton, timerDuration === 15 && styles.selectedTimer]}
                onPress={() => setTimerDuration(15)}
              >
                <Text style={styles.timerText}>15 min</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timerButton, timerDuration === 60 && styles.selectedTimer]}
                onPress={() => setTimerDuration(60)}
              >
                <Text style={styles.timerText}>1 hr</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timerButton, timerDuration === 240 && styles.selectedTimer]}
                onPress={() => setTimerDuration(240)}
              >
                <Text style={styles.timerText}>4 hr</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.customTimer}>
              <TextInput
                style={styles.input}
                placeholder="Custom minutes"
                keyboardType="numeric"
                value={customDuration}
                onChangeText={setCustomDuration}
              />
              <TouchableOpacity style={styles.setButton} onPress={setCustomTimer}>
                <Text style={styles.setButtonText}>Set</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedTime}>Selected: {formatTime(timerDuration)}</Text>
          </>
        ) : (
          <View style={styles.activeTimer}>
            <Text style={styles.activeTimerText}>Active Check-In</Text>
            <Text style={styles.remainingTime}>{formatTime(remainingTime)} remaining</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trusted Contacts</Text>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactItem}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
              <TouchableOpacity onPress={() => removeContact(item.id)}>
                <Text style={styles.removeButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No contacts added yet</Text>
          }
        />

        <View style={styles.addContact}>
          <TextInput
            style={styles.input}
            placeholder="Contact name"
            value={newContactName}
            onChangeText={setNewContactName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={newContactPhone}
            onChangeText={setNewContactPhone}
          />
          <TouchableOpacity style={styles.addButton} onPress={addContact}>
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pre-written Message</Text>
        <TextInput
          style={styles.messageInput}
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
          placeholder="Write your message here..."
        />
      </View>

      <View style={styles.actionButtons}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startCheckIn}>
            <Text style={styles.startButtonText}>Start Safety Check-In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.checkInButton} onPress={manualCheckIn}>
            <Text style={styles.checkInButtonText}>Manual Check-In</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  timerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timerButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedTimer: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  timerText: {
    fontSize: 16,
  },
  customTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  setButton: {
    backgroundColor: '#2196f3',
    padding: 10,
    borderRadius: 4,
  },
  setButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedTime: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  activeTimer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  activeTimerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  remainingTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 16,
  },
  addContact: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    marginTop: 16,
  },
  startButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkInButton: {
    backgroundColor: '#ff9800',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
