import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { scheduleSafetyCheckIn, cancelSafetyCheckIn } from '../../services/sms';
import { getCurrentLocation, startBackgroundLocationUpdates, stopBackgroundLocationUpdates } from '../../services/location';
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
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
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
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const removeContact = async (id: string) => {
    try {
      setIsLoading(true);
      const db = await initDatabase();
      await db.runAsync('DELETE FROM trusted_contacts WHERE id = ?', [id]);
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Error removing contact:', error);
      Alert.alert('Error', 'Failed to remove contact');
    } finally {
      setIsLoading(false);
    }
  };

  const startCheckIn = async () => {
    if (contacts.length === 0) {
      Alert.alert('Error', 'Please add at least one trusted contact');
      return;
    }

    try {
      setIsLoading(true);
      const checkIn: SafetyCheckIn = {
        id: Date.now().toString(),
        timerDuration,
        message,
        contacts,
        createdAt: new Date()
      };

      await scheduleSafetyCheckIn(checkIn);
      await startBackgroundLocationUpdates();

      setIsActive(true);
      setRemainingTime(timerDuration);
    } catch (error) {
      console.error('Error starting check-in:', error);
      Alert.alert('Error', 'Failed to start safety check-in');
    } finally {
      setIsLoading(false);
    }
  };

  const manualCheckIn = async () => {
    try {
      setIsLoading(true);
      await cancelSafetyCheckIn();
      await stopBackgroundLocationUpdates();

      setIsActive(false);
      setRemainingTime(0);

      Alert.alert('Success', 'You have successfully checked in!');
    } catch (error) {
      console.error('Error with manual check-in:', error);
      Alert.alert('Error', 'Failed to check in');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCheckIn = async () => {
    try {
      setIsLoading(true);
      await cancelSafetyCheckIn();
      await stopBackgroundLocationUpdates();

      setIsActive(false);
      setRemainingTime(0);
    } catch (error) {
      console.error('Error canceling check-in:', error);
      Alert.alert('Error', 'Failed to cancel check-in');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Check-In</Text>

        {isActive ? (
          <View style={styles.activeCheckIn}>
            <Text style={styles.activeTitle}>Check-In Active</Text>
            <Text style={styles.timerText}>{formatTime(remainingTime)} remaining</Text>

            <TouchableOpacity
              style={[styles.button, styles.checkInButton]}
              onPress={manualCheckIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>I'm Safe</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelCheckIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cancel Check-In</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Timer Duration</Text>
            <View style={styles.durationOptions}>
              {[15, 30, 60, 120, 240].map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    timerDuration === duration && styles.selectedDuration
                  ]}
                  onPress={() => setTimerDuration(duration)}
                >
                  <Text style={[
                    styles.durationText,
                    timerDuration === duration && styles.selectedDurationText
                  ]}>
                    {formatTime(duration)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customDuration}>
              <TextInput
                style={styles.input}
                placeholder="Custom minutes"
                keyboardType="numeric"
                value={customDuration}
                onChangeText={setCustomDuration}
              />
              <TouchableOpacity
                style={styles.setButton}
                onPress={() => {
                  const minutes = parseInt(customDuration);
                  if (!isNaN(minutes) && minutes > 0) {
                    setTimerDuration(minutes);
                  }
                }}
              >
                <Text style={styles.setButtonText}>Set</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Message to Contacts</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            <Text style={styles.label}>Trusted Contacts</Text>
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
              ListEmptyComponent={
                <Text style={styles.emptyText}>No contacts added yet</Text>
              }
            />

            <View style={styles.addContact}>
              <TextInput
                style={[styles.input, styles.contactInput]}
                placeholder="Name"
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <TextInput
                style={[styles.input, styles.contactInput]}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addContact}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Add Contact</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={startCheckIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Start Safety Check-In</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  durationButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedDuration: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  durationText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDurationText: {
    color: '#fff',
    fontWeight: '600',
  },
  customDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  setButton: {
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginLeft: 8,
  },
  setButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addContact: {
    marginTop: 10,
  },
  contactInput: {
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  checkInButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  activeCheckIn: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4CAF50',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});
