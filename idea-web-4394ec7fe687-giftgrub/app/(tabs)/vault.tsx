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

  const handleEditRecipient = (recipient: Recipient) => {
    setCurrentRecipient(recipient);
    setShowEditModal(true);
  };

  const renderRecipientItem = ({ item }: { item: Recipient }) => (
    <View style={styles.recipientItem}>
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientName}>{item.name}</Text>
        {item.email && <Text style={styles.recipientContact}>{item.email}</Text>}
        {item.phone && <Text style={styles.recipientContact}>{item.phone}</Text>}
        {item.preferences?.birthday && (
          <Text style={styles.recipientDate}>
            Birthday: {formatDate(item.preferences.birthday)}
          </Text>
        )}
        {item.lastGift && (
          <Text style={styles.lastGiftDate}>
            Last gift sent: {new Date(item.lastGift.sent_at).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.recipientActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditRecipient(item)}
        >
          <Ionicons name="create-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecipient(item)}
        >
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gift Vault</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      ) : recipients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recipients yet</Text>
          <Text style={styles.emptySubtext}>Add your first recipient to get started</Text>
        </View>
      ) : (
        <ScrollView style={styles.recipientList}>
          {recipients.map((recipient) => (
            <View key={recipient.id} style={styles.recipientItemContainer}>
              {renderRecipientItem({ item: recipient })}
            </View>
          ))}
        </ScrollView>
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

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowBirthdayPicker(true)}
            >
              <Text style={styles.datePickerText}>
                Birthday: {formatDate(newRecipient.preferences.birthday)}
              </Text>
            </TouchableOpacity>

            {showBirthdayPicker && (
              <DateTimePicker
                value={newRecipient.preferences.birthday ? new Date(newRecipient.preferences.birthday) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowBirthdayPicker(false);
                  if (selectedDate) {
                    setNewRecipient({
                      ...newRecipient,
                      preferences: {
                        ...newRecipient.preferences,
                        birthday: selectedDate.toISOString(),
                      },
                    });
                  }
                }}
              />
            )}

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Birthday Reminders</Text>
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

            <View style={styles.modalActions}>
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
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowBirthdayPicker(true)}
              >
                <Text style={styles.datePickerText}>
                  Birthday: {formatDate(currentRecipient.preferences?.birthday || '')}
                </Text>
              </TouchableOpacity>

              {showBirthdayPicker && (
                <DateTimePicker
                  value={
                    currentRecipient.preferences?.birthday
                      ? new Date(currentRecipient.preferences.birthday)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowBirthdayPicker(false);
                    if (selectedDate && currentRecipient) {
                      setCurrentRecipient({
                        ...currentRecipient,
                        preferences: {
                          ...currentRecipient.preferences,
                          birthday: selectedDate.toISOString(),
                        },
                      });
                    }
                  }}
                />
              )}

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Birthday Reminders</Text>
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

              <View style={styles.modalActions}>
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
                  <Text style={styles.modalButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recipientList: {
    flex: 1,
  },
  recipientItemContainer: {
    marginBottom: 8,
  },
  recipientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recipientContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  recipientDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  lastGiftDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  recipientActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 16,
  },
  deleteButton: {},
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
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    fontWeight: 'bold',
  },
});
