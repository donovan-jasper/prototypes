import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Friend, Streak, getAllFriends, addFriend, initDatabase, getStreak } from '@/lib/database';
import { calculateConnectionScore } from '@/lib/scoring';
import FriendCard from '@/components/FriendCard';
import { getContacts, Contact, filterContacts } from '@/lib/contacts';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const loadFriends = async () => {
    try {
      await initDatabase();
      const allFriends = await getAllFriends();

      const updatedFriends = await Promise.all(allFriends.map(async friend => {
        const streak = await getStreak(friend.id);
        return {
          ...friend,
          connectionScore: calculateConnectionScore(friend.lastContact),
          streak: streak || {
            friendId: friend.id,
            currentDays: 0,
            longestDays: 0,
            lastInteraction: null,
            freezeUsed: false
          }
        };
      }));

      setFriends(updatedFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const contactsList = await getContacts();
      setContacts(contactsList);
      setFilteredContacts(contactsList);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  const handleAddFriend = async () => {
    if (!newFriendName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!newFriendPhone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    try {
      await addFriend(newFriendName.trim(), newFriendPhone.trim());
      setNewFriendName('');
      setNewFriendPhone('');
      setModalVisible(false);
      loadFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend');
    }
  };

  const handleImportContacts = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('No Selection', 'Please select at least one contact to import');
      return;
    }

    try {
      const selected = Array.from(selectedContacts).map(id =>
        contacts.find(c => c.id === id)
      ).filter(Boolean) as Contact[];

      for (const contact of selected) {
        const phone = contact.phoneNumbers[0]?.number || '';
        const email = contact.emails?.[0]?.email || '';
        await addFriend(contact.name, phone, email);
      }

      setSelectedContacts(new Set());
      setImportModalVisible(false);
      loadFriends();
    } catch (error) {
      console.error('Error importing contacts:', error);
      Alert.alert('Error', 'Failed to import contacts');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredContacts(filterContacts(contacts, query));
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };

  const handleFriendPress = (friend: Friend) => {
    Alert.alert(
      friend.name,
      `Phone: ${friend.phone}\nConnection Score: ${friend.connectionScore}`,
      [{ text: 'OK' }]
    );
  };

  const handleFreezeStreak = async (friendId: number) => {
    try {
      // In a real app, you would update the streak in the database
      // For now, we'll just reload the friends to reflect changes
      await loadFriends();
    } catch (error) {
      console.error('Error freezing streak:', error);
      Alert.alert('Error', 'Failed to freeze streak');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            streak={item.streak}
            onPress={() => handleFriendPress(item)}
            onInteractionLogged={loadFriends}
            onFreezeStreak={handleFreezeStreak}
            isPremium={isPremium}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first friend</Text>
          </View>
        }
        contentContainerStyle={friends.length === 0 ? styles.emptyList : styles.list}
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.importFab]}
          onPress={() => {
            setImportModalVisible(true);
            loadContacts();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>📱</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.addFab]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Friend Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Friend</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newFriendName}
              onChangeText={setNewFriendName}
              autoFocus
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={newFriendPhone}
              onChangeText={setNewFriendPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewFriendName('');
                  setNewFriendPhone('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddFriend}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Import Contacts Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.importModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Contacts</Text>
              <Text style={styles.selectedCount}>
                {selectedContacts.size} selected
              </Text>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={handleSearch}
            />

            <ScrollView style={styles.contactsList}>
              {filteredContacts.map(contact => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactItem}
                  onPress={() => toggleContactSelection(contact.id)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.phoneNumbers.length > 0 && (
                      <Text style={styles.contactPhone}>
                        {contact.phoneNumbers[0].number}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={selectedContacts.has(contact.id)}
                    onValueChange={() => toggleContactSelection(contact.id)}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setImportModalVisible(false);
                  setSelectedContacts(new Set());
                  setSearchQuery('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleImportContacts}
              >
                <Text style={styles.addButtonText}>Import Selected</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    gap: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  importFab: {
    backgroundColor: '#34C759',
  },
  addFab: {
    backgroundColor: '#007AFF',
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  importModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  selectedCount: {
    fontSize: 16,
    color: '#666',
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
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsList: {
    flex: 1,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
