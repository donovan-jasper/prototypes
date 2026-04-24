import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Group {
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  members: string[];
  createdAt: Date;
}

const Hive: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    privacy: 'public' as 'public' | 'private'
  });
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'groups'), (snapshot) => {
      const groupsData: Group[] = [];
      snapshot.forEach((doc) => {
        groupsData.push({ id: doc.id, ...doc.data() } as Group);
      });
      setGroups(groupsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a group');
        return;
      }

      const groupData = {
        ...newGroup,
        members: [user.uid],
        createdAt: new Date()
      };

      await addDoc(collection(db, 'groups'), groupData);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', privacy: 'public' });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const handleJoinLeaveGroup = async (group: Group) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to join/leave a group');
        return;
      }

      const groupRef = doc(db, 'groups', group.id);
      if (group.members.includes(user.uid)) {
        // Leave group
        await updateDoc(groupRef, {
          members: arrayRemove(user.uid)
        });
        Alert.alert('Success', `You left ${group.name}`);
      } else {
        // Join group
        await updateDoc(groupRef, {
          members: arrayUnion(user.uid)
        });
        Alert.alert('Success', `You joined ${group.name}`);
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      Alert.alert('Error', 'Failed to update group membership');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No groups found. Create one to get started!</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>Create New Group</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkillHive Groups</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>Create New Group</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupItem}
            onPress={() => setSelectedGroup(item)}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupPrivacy}>
                {item.privacy === 'public' ? 'Public' : 'Private'}
              </Text>
            </View>
            <Text style={styles.groupDescription}>{item.description}</Text>
            <View style={styles.groupFooter}>
              <Text style={styles.memberCount}>{item.members.length} members</Text>
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  item.members.includes(auth.currentUser?.uid || '') && styles.leaveButton
                ]}
                onPress={() => handleJoinLeaveGroup(item)}
              >
                <Text style={styles.joinButtonText}>
                  {item.members.includes(auth.currentUser?.uid || '') ? 'Leave' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Group</Text>

            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={newGroup.name}
              onChangeText={(text) => setNewGroup({...newGroup, name: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              numberOfLines={4}
              value={newGroup.description}
              onChangeText={(text) => setNewGroup({...newGroup, description: text})}
            />

            <View style={styles.privacyContainer}>
              <Text style={styles.privacyLabel}>Privacy:</Text>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  newGroup.privacy === 'public' && styles.selectedPrivacy
                ]}
                onPress={() => setNewGroup({...newGroup, privacy: 'public'})}
              >
                <Text>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  newGroup.privacy === 'private' && styles.selectedPrivacy
                ]}
                onPress={() => setNewGroup({...newGroup, privacy: 'private'})}
              >
                <Text>Private</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedGroup && (
        <Modal
          visible={!!selectedGroup}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedGroup(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedGroup.name}</Text>
              <Text style={styles.groupPrivacy}>
                {selectedGroup.privacy === 'public' ? 'Public Group' : 'Private Group'}
              </Text>
              <Text style={styles.groupDescription}>{selectedGroup.description}</Text>
              <Text style={styles.memberCount}>{selectedGroup.members.length} members</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setSelectedGroup(null)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    selectedGroup.members.includes(auth.currentUser?.uid || '') ? styles.leaveButton : styles.joinButton
                  ]}
                  onPress={() => {
                    handleJoinLeaveGroup(selectedGroup);
                    setSelectedGroup(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    {selectedGroup.members.includes(auth.currentUser?.uid || '') ? 'Leave' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6200EE',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  groupPrivacy: {
    fontSize: 14,
    color: '#666',
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  leaveButton: {
    backgroundColor: '#ff4444',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyLabel: {
    marginRight: 16,
    fontSize: 16,
  },
  privacyOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
  },
  selectedPrivacy: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonText: {
    fontWeight: 'bold',
  },
});

export default Hive;
