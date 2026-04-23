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

  const handleDateChange = (type: 'birthday' | 'anniversary', date: Date) => {
    setNewRecipient({
      ...newRecipient,
      preferences: {
        ...newRecipient.preferences,
        [type]: date.toISOString(),
      },
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
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
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
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
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
        />
      )}

      {renderAddModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
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
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 18,
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
