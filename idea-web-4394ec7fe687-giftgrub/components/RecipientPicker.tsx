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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipients, addRecipient } from '../lib/recipients';
import { Recipient } from '../types';

interface RecipientPickerProps {
  onSelect: (recipient: Recipient) => void;
}

export default function RecipientPicker({ onSelect }: RecipientPickerProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [saving, setSaving] = useState(false);

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
    if (!newRecipientName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!newRecipientEmail.trim() && !newRecipientPhone.trim()) {
      Alert.alert('Error', 'Please enter either an email or phone number');
      return;
    }

    setSaving(true);
    try {
      const newRecipient = await addRecipient({
        name: newRecipientName.trim(),
        email: newRecipientEmail.trim() || undefined,
        phone: newRecipientPhone.trim() || undefined,
      });

      await loadRecipients();
      setShowAddModal(false);
      setNewRecipientName('');
      setNewRecipientEmail('');
      setNewRecipientPhone('');
      onSelect(newRecipient);
    } catch (error) {
      Alert.alert('Error', 'Failed to add recipient');
    } finally {
      setSaving(false);
    }
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

      <TouchableOpacity
        style={styles.addNewButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add-circle" size={24} color="#007AFF" />
        <Text style={styles.addNewText}>Add New Recipient</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredRecipients}
          renderItem={renderRecipientItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Recipient</Text>
            <TouchableOpacity onPress={handleAddRecipient} disabled={saving}>
              <Text style={[styles.modalSaveText, saving && styles.modalSaveTextDisabled]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={newRecipientName}
                onChangeText={setNewRecipientName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={newRecipientEmail}
                onChangeText={setNewRecipientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={newRecipientPhone}
                onChangeText={setNewRecipientPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.helperText}>
              * Required field. At least one contact method (email or phone) is required.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recipientContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalSaveTextDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1
