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

  const renderRecipientItem = ({ item, index }: { item: Recipient, index: number }) => {
    const translateX = swipeAnimations[index]?.swipe || new Animated.Value(0);
    const editOpacity = swipeAnimations[index]?.editOpacity || new Animated.Value(0);
    const deleteOpacity = swipeAnimations[index]?.deleteOpacity || new Animated.Value(0);

    return (
      <View style={styles.recipientContainer}>
        <Animated.View
          style={[
            styles.swipeActions,
            {
              opacity: editOpacity,
              transform: [{ translateX: width - 100 }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.swipeActionButton, styles.editButton]}
            onPress={() => {
              setCurrentRecipient(item);
              setShowEditModal(true);
              handleSwipeEnd(index);
            }}
          >
            <Ionicons name="pencil" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.swipeActions,
            {
              opacity: deleteOpacity,
              transform: [{ translateX: width }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.swipeActionButton, styles.deleteButton]}
            onPress={() => {
              handleDeleteRecipient(item);
              handleSwipeEnd(index);
            }}
          >
            <Ionicons name="trash" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.recipientItem,
            { transform: [{ translateX }] },
          ]}
        >
          <TouchableOpacity
            style={styles.recipientContent}
            onPress={() => router.push(`/recipient/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{item.name}</Text>
              {item.lastGift ? (
                <Text style={styles.lastGiftText}>
                  Last gift sent: {formatDate(item.lastGift.sentAt)}
                </Text>
              ) : (
                <Text style={styles.noGiftText}>No gifts sent yet</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="gift-outline" size={60} color="#999" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No Recipients Yet</Text>
      <Text style={styles.emptySubtitle}>
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
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={styles.loadingIndicator} />
      ) : recipients.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={recipients}
          renderItem={renderRecipientItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Recipient Modal */}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Recipient</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.inputLabel}>Name*</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={newRecipient.name}
                onChangeText={(text) => setNewRecipient({...newRecipient, name: text})}
                autoFocus
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                value={newRecipient.email}
                onChangeText={(text) => setNewRecipient({...newRecipient, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (123) 456-7890"
                value={newRecipient.phone}
                onChangeText={(text) => setNewRecipient({...newRecipient, phone: text})}
                keyboardType="phone-pad"
              />

              <View style={styles.datePickerContainer}>
                <Text style={styles.inputLabel}>Birthday</Text>
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

              {showBirthdayPicker && (
                <DateTimePicker
                  value={newRecipient.preferences.birthday
                    ? new Date(newRecipient.preferences.birthday)
                    : new Date()}
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

              <View style={styles.datePickerContainer}>
                <Text style={styles.inputLabel}>Anniversary</Text>
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

              {showAnniversaryPicker && (
                <DateTimePicker
                  value={newRecipient.preferences.anniversary
                    ? new Date(newRecipient.preferences.anniversary)
                    : new Date()}
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
                  onValueChange={(value) => setNewRecipient({
                    ...newRecipient,
                    preferences: {
                      ...newRecipient.preferences,
                      notificationsEnabled: value,
                    },
                  })}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddRecipient}
              >
                <Text style={styles.saveButtonText}>Add Recipient</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Recipient Modal */}
      {currentRecipient && (
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Recipient</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={styles.inputLabel}>Name*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  value={currentRecipient.name}
                  onChangeText={(text) => setCurrentRecipient({...currentRecipient, name: text})}
                  autoFocus
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  value={currentRecipient.email || ''}
                  onChangeText={(text) => setCurrentRecipient({...currentRecipient, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 (123) 456-7890"
                  value={currentRecipient.phone || ''}
                  onChangeText={(text) => setCurrentRecipient({...currentRecipient, phone: text})}
                  keyboardType="phone-pad"
                />

                <View style={styles.datePickerContainer}>
                  <Text style={styles.inputLabel}>Birthday</Text>
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

                {showBirthdayPicker && (
                  <DateTimePicker
                    value={currentRecipient.preferences?.birthday
                      ? new Date(currentRecipient.preferences.birthday)
                      : new Date()}
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

                <View style={styles.datePickerContainer}>
                  <Text style={styles.inputLabel}>Anniversary</Text>
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

                {showAnniversaryPicker && (
                  <DateTimePicker
                    value={currentRecipient.preferences?.anniversary
                      ? new Date(currentRecipient.preferences.anniversary)
                      : new Date()}
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

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Enable Notifications</Text>
                  <Switch
                    value={currentRecipient.preferences?.notificationsEnabled || false}
                    onValueChange={(value) => setCurrentRecipient({
                      ...currentRecipient,
                      preferences: {
                        ...currentRecipient.preferences,
                        notificationsEnabled: value,
                      },
                    })}
                  />
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.saveButton, styles.deleteButton]}
                    onPress={() => {
                      handleDeleteRecipient(currentRecipient);
                      setShowEditModal(false);
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
            </View>
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
    backgroundColor: 'white',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
  },
  recipientContainer: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recipientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C63FF',
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
    fontSize: 16,
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
  swipeActions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActionButton: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFC107',
  },
  deleteButton: {
    backgroundColor: '#FF3D00',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
