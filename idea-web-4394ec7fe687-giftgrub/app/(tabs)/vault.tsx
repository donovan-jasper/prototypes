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

  const handleDateChange = (type: 'birthday' | 'anniversary', date: Date) => {
    if (type === 'birthday') {
      setNewRecipient({
        ...newRecipient,
        preferences: {
          ...newRecipient.preferences,
          birthday: date.toISOString(),
        },
      });
      setShowBirthdayPicker(false);
    } else {
      setNewRecipient({
        ...newRecipient,
        preferences: {
          ...newRecipient.preferences,
          anniversary: date.toISOString(),
        },
      });
      setShowAnniversaryPicker(false);
    }
  };

  const handleEditDateChange = (type: 'birthday' | 'anniversary', date: Date) => {
    if (!currentRecipient) return;

    setCurrentRecipient({
      ...currentRecipient,
      preferences: {
        ...currentRecipient.preferences,
        [type]: date.toISOString(),
      },
    });

    if (type === 'birthday') {
      setShowBirthdayPicker(false);
    } else {
      setShowAnniversaryPicker(false);
    }
  };

  const renderRecipientItem = ({ item }: { item: Recipient }) => (
    <TouchableOpacity
      style={styles.recipientItem}
      onPress={() => {
        setCurrentRecipient(item);
        setShowEditModal(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientName}>{item.name}</Text>
        {item.lastGift && (
          <Text style={styles.lastGiftText}>
            Last gift sent: {formatDate(item.lastGift.sentAt)}
          </Text>
        )}
        {item.email && <Text style={styles.recipientContact}>{item.email}</Text>}
        {item.phone && <Text style={styles.recipientContact}>{item.phone}</Text>}
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteRecipient(item)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gift Vault</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {recipients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recipients yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add your first recipient to start sending gifts
          </Text>
        </View>
      ) : (
        <RecipientList
          data={recipients}
          renderItem={renderRecipientItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

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
              autoFocus
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newRecipient.email}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, email: text })}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={newRecipient.phone}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, phone: text })}
              keyboardType="phone-pad"
            />

            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Birthday</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowBirthdayPicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {newRecipient.preferences.birthday
                    ? formatDate(newRecipient.preferences.birthday)
                    : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Anniversary</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowAnniversaryPicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {newRecipient.preferences.anniversary
                    ? formatDate(newRecipient.preferences.anniversary)
                    : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Reminders</Text>
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

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  resetNewRecipient();
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddRecipient}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {showBirthdayPicker && (
            <DateTimePicker
              value={newRecipient.preferences.birthday
                ? new Date(newRecipient.preferences.birthday)
                : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                if (date) {
                  handleDateChange('birthday', date);
                } else {
                  setShowBirthdayPicker(false);
                }
              }}
            />
          )}

          {showAnniversaryPicker && (
            <DateTimePicker
              value={newRecipient.preferences.anniversary
                ? new Date(newRecipient.preferences.anniversary)
                : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                if (date) {
                  handleDateChange('anniversary', date);
                } else {
                  setShowAnniversaryPicker(false);
                }
              }}
            />
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Recipient Modal */}
      {currentRecipient && (
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

              <TextInput
                style={styles.input}
                placeholder="Name*"
                value={currentRecipient.name}
                onChangeText={(text) => setCurrentRecipient({ ...currentRecipient, name: text })}
                autoFocus
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={currentRecipient.email || ''}
                onChangeText={(text) => setCurrentRecipient({ ...currentRecipient, email: text })}
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={currentRecipient.phone || ''}
                onChangeText={(text) => setCurrentRecipient({ ...currentRecipient, phone: text })}
                keyboardType="phone-pad"
              />

              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Birthday</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowBirthdayPicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {currentRecipient.preferences?.birthday
                      ? formatDate(currentRecipient.preferences.birthday)
                      : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Anniversary</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowAnniversaryPicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {currentRecipient.preferences?.anniversary
                      ? formatDate(currentRecipient.preferences.anniversary)
                      : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Reminders</Text>
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

              <View style={styles.buttonRow}>
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
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {showBirthdayPicker && (
              <DateTimePicker
                value={currentRecipient.preferences?.birthday
                  ? new Date(currentRecipient.preferences.birthday)
                  : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) {
                    handleEditDateChange('birthday', date);
                  } else {
                    setShowBirthdayPicker(false);
                  }
                }}
              />
            )}

            {showAnniversaryPicker && (
              <DateTimePicker
                value={currentRecipient.preferences?.anniversary
                  ? new Date(currentRecipient.preferences.anniversary)
                  : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) {
                    handleEditDateChange('anniversary', date);
                  } else {
                    setShowAnniversaryPicker(false);
                  }
                }}
              />
            )}
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastGiftText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recipientContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  datePickerText: {
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
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
