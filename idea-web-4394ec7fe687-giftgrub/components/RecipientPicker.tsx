import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipients, addRecipient } from '../lib/recipients';
import { Recipient } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

interface RecipientPickerProps {
  onSelect: (recipient: Recipient) => void;
  onAddNew?: () => void;
  showAddButton?: boolean;
}

export default function RecipientPicker({
  onSelect,
  onAddNew,
  showAddButton = true,
}: RecipientPickerProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
  const [saving, setSaving] = useState(false);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [showAnniversaryPicker, setShowAnniversaryPicker] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = recipients.filter((recipient) =>
        recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.phone?.includes(searchQuery)
      );
      setFilteredRecipients(filtered);
    } else {
      setFilteredRecipients(recipients);
    }
  }, [searchQuery, recipients]);

  const loadRecipients = async () => {
    setLoading(true);
    try {
      const results = await getRecipients();
      setRecipients(results);
      setFilteredRecipients(results);
    } catch (error) {
      console.error('Failed to load recipients:', error);
      setRecipients([]);
      setFilteredRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async () => {
    if (!newRecipient.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!newRecipient.email.trim() && !newRecipient.phone.trim()) {
      Alert.alert('Error', 'Please enter either an email or phone number');
      return;
    }

    setSaving(true);
    try {
      const addedRecipient = await addRecipient(newRecipient);
      await loadRecipients();
      setShowAddModal(false);
      resetNewRecipient();
      onSelect(addedRecipient);
      if (onAddNew) onAddNew();
    } catch (error) {
      Alert.alert('Error', 'Failed to add recipient');
    } finally {
      setSaving(false);
    }
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

  const renderRecipientItem = ({ item }: { item: Recipient }) => (
    <TouchableOpacity
      style={styles.recipientItem}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientName}>{item.name}</Text>
        {item.email && <Text style={styles.recipientContact}>{item.email}</Text>}
        {item.phone && <Text style={styles.recipientContact}>{item.phone}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'No recipients found' : 'No recipients yet'}
      </Text>
      {showAddButton && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>Add New Recipient</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={styles.loadingIndicator} />
      ) : filteredRecipients.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredRecipients}
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
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Recipient</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  loadingIndicator: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: 'white',
    fontSize: 16,
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
  recipientContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
});
