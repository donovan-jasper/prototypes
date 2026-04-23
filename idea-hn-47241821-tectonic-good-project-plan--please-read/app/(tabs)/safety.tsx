import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { scheduleSafetyCheckIn, cancelSafetyCheckIn, processOfflineMessages, checkForExpiredTimers } from '../../services/sms';
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
    checkForExpiredTimers();

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
        createdAt: new Date(),
      };

      await scheduleSafetyCheckIn(checkIn);
      await startBackgroundLocationUpdates();

      setIsActive(true);
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

      Alert.alert('Success', 'You have successfully checked in. Your safety check-in has been canceled.');
    } catch (error) {
      console.error('Error with manual check-in:', error);
      Alert.alert('Error', 'Failed to process manual check-in');
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
      <View style={styles.header}>
        <Text style={styles.title}>Safety Check-In</Text>
        <Text style={styles.subtitle}>
          Set a timer to automatically share your location with trusted contacts if you don't check in.
        </Text>
      </View>

      {isActive ? (
        <View style={styles.activeContainer}>
          <Text style={styles.activeTitle}>Active Check-In</Text>
          <Text style={styles.timerText}>
            {formatTime(remainingTime)}
          </Text>
          <Text style={styles.messageText}>{message}</Text>

          <View style={styles.contactsContainer}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            {contacts.map(contact => (
              <View key={contact.id} style={styles.contactItem}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelCheckIn}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancel Check-In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.checkInButton]}
              onPress={manualCheckIn}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Manual Check-In</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timer Duration</Text>
            <View style={styles.timerOptions}>
              {[15, 30, 60, 120].map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.timerOption,
                    timerDuration === duration && styles.timerOptionSelected
                  ]}
                  onPress={() => setTimerDuration(duration)}
                >
                  <Text style={[
                    styles.timerOptionText,
                    timerDuration === duration && styles.timerOptionTextSelected
                  ]}>
                    {formatTime(duration)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customTimerContainer}>
              <TextInput
                style={styles.customTimerInput}
                placeholder="Custom (minutes)"
                keyboardType="numeric"
                value={customDuration}
                onChangeText={setCustomDuration}
                onBlur={() => {
                  if (customDuration) {
                    const minutes = parseInt(customDuration);
                    if (!isNaN(minutes) && minutes > 0) {
                      setTimerDuration(minutes);
                    }
                  }
                }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message</Text>
            <TextInput
              style={styles.messageInput}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              placeholder="Write a message to be sent with your location"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            {contacts.length > 0 ? (
              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.contactItem}>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeContactButton}
                      onPress={() => removeContact(item.id)}
                    >
                      <Text style={styles.removeContactText}>Remove</Text>
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
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.addContactButton}
                onPress={addContact}
                disabled={isLoading}
              >
                <Text style={styles.addContactButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={startCheckIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startButtonText}>Start Safety Check-In</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {showConfirmation && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationText}>Safety Check-In Started!</Text>
            <Text style={styles.confirmationSubtext}>
              Your location will be shared if you don't check in within {formatTime(timerDuration)}.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  timerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timerOption: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '23%',
    alignItems: 'center',
  },
  timerOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timerOptionText: {
    color: '#333',
  },
  timerOptionTextSelected: {
    color: 'white',
  },
  customTimerContainer: {
    marginTop: 10,
  },
  customTimerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeContactButton: {
    padding: 5,
  },
  removeContactText: {
    color: '#ff3b30',
    fontSize: 14,
  },
  noContactsText: {
    color: '#999',
    textAlign: 'center',
    padding: 10,
  },
  addContactContainer: {
    marginTop: 10,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  addContactButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addContactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 15,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  contactsContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  confirmationBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmationSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
