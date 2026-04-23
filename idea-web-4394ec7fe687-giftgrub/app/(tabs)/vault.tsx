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

  const handleSwipeStart = (index: number) => {
    Animated.timing(swipeAnimations[index].swipe, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(swipeAnimations[index].editOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(swipeAnimations[index].deleteOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSwipeEnd = (index: number) => {
    Animated.timing(swipeAnimations[index].swipe, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(swipeAnimations[index].editOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(swipeAnimations[index].deleteOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const renderRecipientItem = ({ item, index }: { item: Recipient; index: number }) => {
    const animatedStyle = {
      transform: [{ translateX: swipeAnimations[index]?.swipe || new Animated.Value(0) }],
    };

    const editButtonStyle = {
      opacity: swipeAnimations[index]?.editOpacity || new Animated.Value(0),
    };

    const deleteButtonStyle = {
      opacity: swipeAnimations[index]?.deleteOpacity || new Animated.Value(0),
    };

    return (
      <View style={styles.recipientContainer}>
        <Animated.View style={[styles.swipeableContainer, animatedStyle]}>
          <TouchableOpacity
            style={styles.recipientItem}
            onPress={() => router.push(`/gift/send?recipientId=${item.id}`)}
            activeOpacity={0.7}
            onLongPress={() => handleSwipeStart(index)}
            onPressOut={() => handleSwipeEnd(index)}
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
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.editButton, editButtonStyle]}>
          <TouchableOpacity
            onPress={() => {
              setCurrentRecipient(item);
              setShowEditModal(true);
            }}
          >
            <Ionicons name="pencil" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
          <TouchableOpacity onPress={() => handleDeleteRecipient(item)}>
            <Ionicons name="trash" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No recipients yet</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>Add First Recipient</Text>
      </TouchableOpacity>
    </View>
  );

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
              <Text style={styles.modalButtonText}>Add Recipient</Text>
            </TouchableOpacity>
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
                if (date && currentRecipient) {
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
                if (date && currentRecipient) {
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

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Notifications</Text>
            <Switch
              value={currentRecipient?.preferences?.notificationsEnabled || false}
              onValueChange={(value) =>
                setCurrentRecipient({
                  ...currentRecipient!,
                  preferences: {
                    ...currentRecipient!.preferences,
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
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={styles.loading} />
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
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
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
  recipientContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  swipeableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginTop: 4,
  },
  editButton: {
    position: 'absolute',
    right: 60,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
    backgroundColor: '#6C63FF',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
