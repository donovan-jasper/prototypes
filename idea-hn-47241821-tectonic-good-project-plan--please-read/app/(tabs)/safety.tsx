import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { scheduleSafetyCheckIn, cancelSafetyCheckIn, processOfflineMessages } from '../../services/sms';
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
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadContacts();
    checkActiveCheckIn();
    setupNotifications();
    processOfflineMessages();

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
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    } catch (error) {
      console.error('Error starting check-in:', error);
      Alert.alert('Error', 'Failed to start safety check-in');
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
      Alert.alert('Error', 'Failed to cancel safety check-in');
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

      Alert.alert('Success', 'You have successfully checked in. Your contacts will not be notified.');
    } catch (error) {
      console.error('Error with manual check-in:', error);
      Alert.alert('Error', 'Failed to complete manual check-in');
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
          <View style={styles.activeContainer}>
            <Text style={styles.activeTitle}>Check-In Active</Text>
            <Text style={styles.timerText}>{formatTime(remainingTime)} remaining</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelCheckIn}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.checkInButton]}
                onPress={manualCheckIn}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Check In Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Timer Duration</Text>
            <View style={styles.durationOptions}>
              {[15, 30, 60, 120].map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    timerDuration === duration && styles.durationButtonSelected
                  ]}
                  onPress={() => setTimerDuration(duration)}
                >
                  <Text style={[
                    styles.durationButtonText,
                    timerDuration === duration && styles.durationButtonTextSelected
                  ]}>
                    {formatTime(duration)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customDurationContainer}>
              <TextInput
                style={styles.customDurationInput}
                placeholder="Custom (minutes)"
                keyboardType="numeric"
                value={customDuration}
                onChangeText={text => {
                  setCustomDuration(text);
                  if (text && !isNaN(parseInt(text))) {
                    setTimerDuration(parseInt(text));
                  }
                }}
              />
            </View>

            <Text style={styles.label}>Message to Contacts</Text>
            <TextInput
              style={styles.messageInput}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            <Text style={styles.label}>Trusted Contacts</Text>
            {contacts.length > 0 ? (
              <FlatList
                data={contacts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeContact(item.id)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noContactsText}>No contacts added yet</Text>
            )}

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
                keyboardType="phone-pad"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addContact}
                disabled={isLoading}
              >
                <Text style={styles.addButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={startCheckIn}
              disabled={isLoading || contacts.length === 0}
            >
              <Text style={styles.startButtonText}>Start Safety Check-In</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {showConfirmation && (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>Safety Check-In Started!</Text>
          <Text style={styles.confirmationSubtext}>
            Your location will be shared with trusted contacts if you don't check in by {formatTime(timerDuration)}.
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  durationButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '23%',
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  durationButtonText: {
    color: '#666',
  },
  durationButtonTextSelected: {
    color: 'white',
  },
  customDurationContainer: {
    marginBottom: 16,
  },
  customDurationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  noContactsText: {
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  addContactContainer: {
    marginBottom: 16,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  activeContainer: {
    alignItems: 'center',
    padding: 16,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34C759',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  checkInButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationContainer: {
    backgroundColor: '#E5F7E5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  confirmationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C7A2C',
    marginBottom: 4,
  },
  confirmationSubtext: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
