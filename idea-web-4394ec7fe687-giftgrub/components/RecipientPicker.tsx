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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipients, addRecipient } from '../lib/recipients';
import { Recipient } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RecipientPickerProps {
  onSelect: (recipient: Recipient) => void;
  onAddNew?: () => void;
}

export default function RecipientPicker({ onSelect, onAddNew }: RecipientPickerProps) {
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>Add New Recipient</Text>
      </TouchableOpacity>
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
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      ) : filteredRecipients.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredRecipients}
          renderItem={renderRecipientItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recipientContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 72,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
