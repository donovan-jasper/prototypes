import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
            Last gift sent: {new Date(item.lastGift.sent_at).toLocaleDateString()}
          </Text>
        )}
        {item.email && <Text style={styles.contactText}>{item.email}</Text>}
        {item.phone && <Text style={styles.contactText}>{item.phone}</Text>}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setCurrentRecipient(item);
            setShowEditModal(true);
          }}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteRecipient(item)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="gift-outline" size={60} color="#999" />
      <Text style={styles.emptyStateText}>No recipients yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Add your first recipient to start sending gifts
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>Add Recipient</Text>
      </TouchableOpacity>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : recipients.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={recipients}
          renderItem={renderRecipientItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Recipient Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Recipient</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newRecipient.name}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, name: text })}
              autoFocus
            />

            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              value={newRecipient.email}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, email: text })}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              value={newRecipient.phone}
              onChangeText={(text) => setNewRecipient({ ...newRecipient, phone: text })}
              keyboardType="phone-pad"
            />

            <View style={styles.datePickerContainer}>
              <Text style={styles.label}>Birthday</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowBirthdayPicker(true)}
              >
                <Text style={styles.dateText}>
                  {newRecipient.preferences.birthday
                    ? formatDate(newRecipient.preferences.birthday)
                    : 'Select date'}
                </Text>
              </TouchableOpacity>
              {showBirthdayPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowBirthdayPicker(false);
                    if (date) {
                      setNewRecipient({
                        ...newRecipient,
                        preferences: {
                          ...newRecipient.preferences,
                          birthday: date.toISOString(),
                        },
                      });
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.datePickerContainer}>
              <Text style={styles.label}>Anniversary</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowAnniversaryPicker(true)}
              >
                <Text style={styles.dateText}>
                  {newRecipient.preferences.anniversary
                    ? formatDate(newRecipient.preferences.anniversary)
                    : 'Select date'}
                </Text>
              </TouchableOpacity>
              {showAnniversaryPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowAnniversaryPicker(false);
                    if (date) {
                      setNewRecipient({
                        ...newRecipient,
                        preferences: {
                          ...newRecipient.preferences,
                          anniversary: date.toISOString(),
                        },
                      });
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Enable Notifications</Text>
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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddRecipient}
            >
              <Text style={styles.saveButtonText}>Add Recipient</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Recipient Modal */}
      {currentRecipient && (
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Recipient</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={currentRecipient.name}
                onChangeText={(text) =>
                  setCurrentRecipient({ ...currentRecipient, name: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Email (optional)"
                value={currentRecipient.email || ''}
                onChangeText={(text) =>
                  setCurrentRecipient({ ...currentRecipient, email: text })
                }
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                value={currentRecipient.phone || ''}
                onChangeText={(text) =>
                  setCurrentRecipient({ ...currentRecipient, phone: text })
                }
                keyboardType="phone-pad"
              />

              <View style={styles.datePickerContainer}>
                <Text style={styles.label}>Birthday</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowBirthdayPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {currentRecipient.preferences?.birthday
                      ? formatDate(currentRecipient.preferences.birthday)
                      : 'Select date'}
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
                    onChange={(event, date) => {
                      setShowBirthdayPicker(false);
                      if (date) {
                        setCurrentRecipient({
                          ...currentRecipient,
                          preferences: {
                            ...currentRecipient.preferences,
                            birthday: date.toISOString(),
                          },
                        });
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.datePickerContainer}>
                <Text style={styles.label}>Anniversary</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowAnniversaryPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {currentRecipient.preferences?.anniversary
                      ? formatDate(currentRecipient.preferences.anniversary)
                      : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showAnniversaryPicker && (
                  <DateTimePicker
                    value={
                      currentRecipient.preferences?.anniversary
                        ? new Date(currentRecipient.preferences.anniversary)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowAnniversaryPicker(false);
                      if (date) {
                        setCurrentRecipient({
                          ...currentRecipient,
                          preferences: {
                            ...currentRecipient.preferences,
                            anniversary: date.toISOString(),
                          },
                        });
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Enable Notifications</Text>
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

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.saveButton, styles.deleteButton]}
                  onPress={() => {
                    setShowEditModal(false);
                    handleDeleteRecipient(currentRecipient);
                  }}
                >
                  <Text style={styles.saveButtonText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateRecipient}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastGiftText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flex: 1,
    marginRight: 8,
  },
});
