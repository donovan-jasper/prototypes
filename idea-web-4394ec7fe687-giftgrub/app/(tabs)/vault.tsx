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
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getRecipients, deleteRecipient, updateRecipient, addRecipient } from '../../lib/recipients';
import { getSentGiftsByRecipient } from '../../lib/gifts';
import { Recipient, SentGift } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

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
  const [swipeAnimations, setSwipeAnimations] = useState<{[key: number]: Animated.Value}[]>([]);

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
      // Initialize swipe animations
      setSwipeAnimations(recipientsWithGifts.map(() => ({
        swipe: new Animated.Value(0),
        editOpacity: new Animated.Value(0),
        deleteOpacity: new Animated.Value(0),
      })));
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

  const handleToggleNotifications = async (recipient: Recipient, value: boolean) => {
    try {
      const updatedRecipient = {
        ...recipient,
        preferences: {
          ...recipient.preferences,
          notificationsEnabled: value,
        },
      };
      await updateRecipient(recipient.id, updatedRecipient);
      await loadRecipients();

      if (value) {
        await scheduleNotification(updatedRecipient);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const handleDateChange = (type: 'birthday' | 'anniversary', date: Date) => {
    if (currentRecipient) {
      const updatedRecipient = {
        ...currentRecipient,
        preferences: {
          ...currentRecipient.preferences,
          [type]: date.toISOString(),
        },
      };
      setCurrentRecipient(updatedRecipient);
    } else {
      setNewRecipient({
        ...newRecipient,
        preferences: {
          ...newRecipient.preferences,
          [type]: date.toISOString(),
        },
      });
    }
  };

  const renderRecipientItem = ({ item, index }: { item: Recipient; index: number }) => {
    const animation = swipeAnimations[index] || {
      swipe: new Animated.Value(0),
      editOpacity: new Animated.Value(0),
      deleteOpacity: new Animated.Value(0),
    };

    const handleSwipeStart = () => {
      Animated.timing(animation.swipe, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(animation.editOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(animation.deleteOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const handleSwipeEnd = () => {
      Animated.timing(animation.swipe, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(animation.editOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(animation.deleteOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ translateX: animation.swipe }] }}>
        <TouchableOpacity
          style={styles.recipientItem}
          onPress={() => {
            setCurrentRecipient(item);
            setShowEditModal(true);
          }}
          activeOpacity={0.7}
          onLongPress={handleSwipeStart}
          onPressOut={handleSwipeEnd}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{item.name}</Text>
            {item.lastGift && (
              <Text style={styles.lastGiftText}>
                Last gift: {item.lastGift.giftTitle} on {formatDate(item.lastGift.sentAt)}
              </Text>
            )}
            {!item.lastGift && (
              <Text style={styles.noGiftText}>No gifts sent yet</Text>
            )}
          </View>
          <View style={styles.actionsContainer}>
            <Animated.View style={[styles.actionButton, { opacity: animation.editOpacity }]}>
              <TouchableOpacity
                onPress={() => {
                  setCurrentRecipient(item);
                  setShowEditModal(true);
                }}
              >
                <Ionicons name="create-outline" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.actionButton, { opacity: animation.deleteOpacity }]}>
              <TouchableOpacity onPress={() => handleDeleteRecipient(item)}>
                <Ionicons name="trash-outline" size={24} color="#F44336" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
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
              onChange={(event, date) => {
                setShowBirthdayPicker(false);
                if (date) handleDateChange('birthday', date);
              }}
            />
          )}

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowAnniversaryPicker(true)}
          >
            <Text style={styles.datePickerText}>
              Anniversary: {formatDate(newRecipient.preferences.anniversary)}
            </Text>
          </TouchableOpacity>

          {showAnniversaryPicker && (
            <DateTimePicker
              value={newRecipient.preferences.anniversary ? new Date(newRecipient.preferences.anniversary) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowAnniversaryPicker(false);
                if (date) handleDateChange('anniversary', date);
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
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Recipient</Text>

          <TextInput
            style={styles.input}
            placeholder="Name*"
            value={currentRecipient?.name || ''}
            onChangeText={(text) => setCurrentRecipient({ ...currentRecipient!, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={currentRecipient?.email || ''}
            onChangeText={(text) => setCurrentRecipient({ ...currentRecipient!, email: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={currentRecipient?.phone || ''}
            onChangeText={(text) => setCurrentRecipient({ ...currentRecipient!, phone: text })}
          />

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowBirthdayPicker(true)}
          >
            <Text style={styles.datePickerText}>
              Birthday: {formatDate(currentRecipient?.preferences?.birthday || '')}
            </Text>
          </TouchableOpacity>

          {showBirthdayPicker && (
            <DateTimePicker
              value={currentRecipient?.preferences?.birthday ? new Date(currentRecipient.preferences.birthday) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowBirthdayPicker(false);
                if (date && currentRecipient) handleDateChange('birthday', date);
              }}
            />
          )}

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowAnniversaryPicker(true)}
          >
            <Text style={styles.datePickerText}>
              Anniversary: {formatDate(currentRecipient?.preferences?.anniversary || '')}
            </Text>
          </TouchableOpacity>

          {showAnniversaryPicker && (
            <DateTimePicker
              value={currentRecipient?.preferences?.anniversary ? new Date(currentRecipient.preferences.anniversary) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowAnniversaryPicker(false);
                if (date && currentRecipient) handleDateChange('anniversary', date);
              }}
            />
          )}

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Birthday Reminders</Text>
            <Switch
              value={currentRecipient?.preferences?.notificationsEnabled || false}
              onValueChange={(value) => {
                if (currentRecipient) {
                  setCurrentRecipient({
                    ...currentRecipient,
                    preferences: {
                      ...currentRecipient.preferences,
                      notificationsEnabled: value,
                    },
                  });
                  handleToggleNotifications(currentRecipient, value);
                }
              }}
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
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
  );

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

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      ) : recipients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recipients yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>Add First Recipient</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipients}
          renderItem={renderRecipientItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {renderAddModal()}
      {renderEditModal()}
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
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  lastGiftText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noGiftText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    width: 100,
  },
  actionButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
