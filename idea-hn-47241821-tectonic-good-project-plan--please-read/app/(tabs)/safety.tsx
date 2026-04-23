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
        createdAt: new Date(),
      };

      await scheduleSafetyCheckIn(checkIn);
      setIsActive(true);
      setShowConfirmation(true);

      // Show success notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Safety Check-In Started',
          body: `Your location will be shared in ${timerDuration} minutes if you don't check in.`,
          sound: 'default',
        },
        trigger: null,
      });
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
      setIsActive(false);
      setShowConfirmation(false);

      // Show cancellation notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Safety Check-In Canceled',
          body: 'Your safety check-in has been canceled.',
          sound: 'default',
        },
        trigger: null,
      });
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
      setIsActive(false);
      setShowConfirmation(false);

      // Show manual check-in notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Manual Check-In',
          body: 'You have manually checked in. Your safety check-in has been canceled.',
          sound: 'default',
        },
        trigger: null,
      });

      Alert.alert('Success', 'You have manually checked in. Your safety check-in has been canceled.');
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
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };

  const renderContactItem = ({ item }: { item: TrustedContact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
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
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Safety Check-In</Text>

      {isActive ? (
        <View style={styles.activeContainer}>
          <Text style={styles.activeTitle}>Active Safety Check-In</Text>
          <Text style={styles.timerText}>
            Time remaining: {formatTime(remainingTime)}
          </Text>

          <View style={styles.messageContainer}>
            <Text style={styles.sectionTitle}>Your Message</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          <View style={styles.contactsContainer}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            <FlatList
              data={contacts}
              renderItem={renderContactItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
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
              <Text style={styles.buttonText}>I'm Safe</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timer Duration</Text>
            <View style={styles.timerOptions}>
              {[15, 30, 60, 120].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.timerButton,
                    timerDuration === duration && styles.selectedTimer
                  ]}
                  onPress={() => setTimerDuration(duration)}
                >
                  <Text style={styles.timerButtonText}>{formatTime(duration)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customTimerContainer}>
              <TextInput
                style={styles.customTimerInput}
                placeholder="Custom minutes"
                keyboardType="numeric"
                value={customDuration}
                onChangeText={setCustomDuration}
              />
              <TouchableOpacity
                style={styles.customTimerButton}
                onPress={() => {
                  const num = parseInt(customDuration);
                  if (!isNaN(num) && num > 0) {
                    setTimerDuration(num);
                  }
                }}
              >
                <Text style={styles.customTimerButtonText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message to Contacts</Text>
            <TextInput
              style={styles.messageInput}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            <FlatList
              data={contacts}
              renderItem={renderContactItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />

            <View style={styles.addContactContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addContact}
                disabled={isLoading}
              >
                <Text style={styles.addButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startButton, isLoading && styles.disabledButton]}
            onPress={startCheckIn}
            disabled={isLoading || contacts.length === 0}
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
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>
            Your safety check-in is active. You will be automatically notified if you don't check in within {formatTime(timerDuration)}.
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  timerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '23%',
    alignItems: 'center',
  },
  selectedTimer: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timerButtonText: {
    color: '#333',
  },
  customTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customTimerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  customTimerButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  customTimerButtonText: {
    color: '#fff',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addContactContainer: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactPhone: {
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
  },
  activeContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4CAF50',
  },
  timerText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
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
    backgroundColor: '#f44336',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmationContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  confirmationText: {
    color: '#2e7d32',
    textAlign: 'center',
  },
});
