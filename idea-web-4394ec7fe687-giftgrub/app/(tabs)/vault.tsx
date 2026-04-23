import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getRecipients, deleteRecipient, updateRecipient, addRecipient } from '../../lib/recipients';
import { getSentGiftsByRecipient } from '../../lib/gifts';
import { Recipient, SentGift } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import RecipientList from '../../components/RecipientList';

export default function VaultScreen() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRecipient, setCurrentRecipient] = useState<Recipient | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    email: '',
    phone: '',
    preferences: {
      birthday: '',
      anniversary: '',
      notificationsEnabled: true,
    },
  });
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [showAnniversaryPicker, setShowAnniversaryPicker] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setLoading(true);
    try {
      const results = await getRecipients();
      const recipientsWithGifts = await Promise.all(
        results.map(async (recipient) => {
          const gifts = await getSentGiftsByRecipient(recipient.id);
          return { ...recipient, lastGift: gifts[0] || null };
        })
      );
      setRecipients(recipientsWithGifts);
    } catch (error) {
      console.error('Failed to load recipients:', error);
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async () => {
    if (!newRecipient.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      await addRecipient(newRecipient);
      await loadRecipients();
      setShowAddModal(false);
      resetNewRecipient();
    } catch (error) {
      Alert.alert('Error', 'Failed to add recipient');
    }
  };

  const handleUpdateRecipient = async () => {
    if (!currentRecipient) return;

    try {
      await updateRecipient(currentRecipient.id, currentRecipient);
      await loadRecipients();
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update recipient');
    }
  };

  const handleDeleteRecipient = (recipient: Recipient) => {
    Alert.alert(
      'Delete Recipient',
      `Are you sure you want to delete ${recipient.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipient(recipient.id);
              await loadRecipients();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recipient');
            }
          },
        },
      ]
    );
  };

  const resetNewRecipient = () => {
    setNewRecipient({
      name: '',
      email: '',
      phone: '',
      preferences: {
        birthday: '',
        anniversary: '',
        notificationsEnabled: true,
      },
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const scheduleNotification = async (recipient: Recipient) => {
    if (!recipient.preferences?.notificationsEnabled) return;

    const now = new Date();
    const threeDaysFromNow = new Date(now.setDate(now.getDate() + 3));

    if (recipient.preferences?.birthday) {
      const birthdayDate = new Date(recipient.preferences.birthday);
      birthdayDate.setFullYear(threeDaysFromNow.getFullYear());

      if (birthdayDate > threeDaysFromNow) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Upcoming Birthday!`,
            body: `Don't forget to send a gift to ${recipient.name}!`,
            data: { recipientId: recipient.id },
          },
          trigger: {
            date: birthdayDate,
          },
        });
      }
    }

    if (recipient.preferences?.anniversary) {
      const anniversaryDate = new Date(recipient.preferences.anniversary);
      anniversaryDate.setFullYear(threeDaysFromNow.getFullYear());

      if (anniversaryDate > threeDaysFromNow) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Upcoming Anniversary!`,
            body: `Don't forget to send a gift to ${recipient.name}!`,
            data: { recipientId: recipient.id },
          },
          trigger: {
            date: anniversaryDate,
          },
        });
      }
    }
  };

  const handleSelectRecipient = (recipient: Recipient) => {
    router.push({
      pathname: '/gift/send',
      params: { recipientId: recipient.id },
    });
  };

  const handleEditRecipient = (recipient: Recipient) => {
    setCurrentRecipient({ ...recipient });
    setShowEditModal(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date, field?: 'birthday' | 'anniversary') => {
    if (Platform.OS === 'android') {
      setShowBirthdayPicker(false);
      setShowAnniversaryPicker(false);
    }

    if (selectedDate && field) {
      if (currentRecipient) {
        setCurrentRecipient({
          ...currentRecipient,
          preferences: {
            ...currentRecipient.preferences,
            [field]: selectedDate.toISOString(),
          },
        });
      } else {
        setNewRecipient({
          ...newRecipient,
          preferences: {
            ...newRecipient.preferences,
            [field]: selectedDate.toISOString(),
          },
        });
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gift Vault</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <RecipientList
        recipients={recipients}
        onSelect={handleSelectRecipient}
        onEdit={handleEditRecipient}
        onDelete={handleDeleteRecipient}
      />

      {/* Add Recipient Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Recipient</Text>

            <TextInput
              style={styles.input}
              placeholder="Name*"
              value={newRecipient.name}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={newRecipient.email}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, email: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={newRecipient.phone}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, phone: text })}
            />

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowBirthdayPicker(true)}
            >
              <Text style={styles.dateText}>
                {newRecipient.preferences.birthday
                  ? `Birthday: ${formatDate(newRecipient.preferences.birthday)}`
                  : 'Set Birthday'}
              </Text>
            </TouchableOpacity>

            {showBirthdayPicker && (
              <DateTimePicker
                value={newRecipient.preferences.birthday ? new Date(newRecipient.preferences.birthday) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(event, date, 'birthday')}
              />
            )}

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowAnniversaryPicker(true)}
            >
              <Text style={styles.dateText}>
                {newRecipient.preferences.anniversary
                  ? `Anniversary: ${formatDate(newRecipient.preferences.anniversary)}`
                  : 'Set Anniversary'}
              </Text>
            </TouchableOpacity>

            {showAnniversaryPicker && (
              <DateTimePicker
                value={newRecipient.preferences.anniversary ? new Date(newRecipient.preferences.anniversary) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(event, date, 'anniversary')}
              />
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable Notifications</Text>
              <Switch
                value={newRecipient.preferences.notificationsEnabled}
                onValueChange={(value) =>
                  setNewRecipient({
                    ...newRecipient,
                    preferences: {
                      ...newRecipient.preferences,
                      notificationsEnabled: value,
                    },
                  })
                }
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddRecipient}
              >
                <Text style={styles.modalButtonText}>Add Recipient</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Recipient Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Recipient</Text>

            {currentRecipient && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Name*"
                  value={currentRecipient.name}
                  onChangeText={(text) => setCurrentRecipient({ ...currentRecipient, name: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  value={currentRecipient.email || ''}
                  onChangeText={(text) => setCurrentRecipient({ ...currentRecipient, email: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  value={currentRecipient.phone || ''}
                  onChangeText={(text) => setCurrentRecipient({ ...currentRecipient, phone: text })}
                />

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowBirthdayPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {currentRecipient.preferences?.birthday
                      ? `Birthday: ${formatDate(currentRecipient.preferences.birthday)}`
                      : 'Set Birthday'}
                  </Text>
                </TouchableOpacity>

                {showBirthdayPicker && (
                  <DateTimePicker
                    value={currentRecipient.preferences?.birthday ? new Date(currentRecipient.preferences.birthday) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'birthday')}
                  />
                )}

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowAnniversaryPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {currentRecipient.preferences?.anniversary
                      ? `Anniversary: ${formatDate(currentRecipient.preferences.anniversary)}`
                      : 'Set Anniversary'}
                  </Text>
                </TouchableOpacity>

                {showAnniversaryPicker && (
                  <DateTimePicker
                    value={currentRecipient.preferences?.anniversary ? new Date(currentRecipient.preferences.anniversary) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'anniversary')}
                  />
                )}

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Enable Notifications</Text>
                  <Switch
                    value={currentRecipient.preferences?.notificationsEnabled || false}
                    onValueChange={(value) =>
                      setCurrentRecipient({
                        ...currentRecipient,
                        preferences: {
                          ...currentRecipient.preferences,
                          notificationsEnabled: value,
                        },
                      })
                    }
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleUpdateRecipient}
                  >
                    <Text style={styles.modalButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  dateInput: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
