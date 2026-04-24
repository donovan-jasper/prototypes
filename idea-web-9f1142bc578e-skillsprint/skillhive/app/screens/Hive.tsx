import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const q = query(collection(db, 'groups'));
      const querySnapshot = await getDocs(q);
      const groupsData: Group[] = [];
      querySnapshot.forEach((doc) => {
        groupsData.push({ id: doc.id, ...doc.data() } as Group);
      });
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

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
      fetchGroups();
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
      fetchGroups();
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      Alert.alert('Error', 'Failed to update group membership');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
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
                style={[styles.modalButton, styles.createButtonModal]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <Modal
          visible={!!selectedGroup}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedGroup.name}</Text>
              <Text style={styles.groupDetailDescription}>{selectedGroup.description}</Text>

              <Text style={styles.sectionTitle}>Members ({selectedGroup.members.length})</Text>
              <Text style={styles.memberList}>
                {selectedGroup.members.length > 0 ? selectedGroup.members.join(', ') : 'No members yet'}
              </Text>

              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.activityText}>No recent activity</Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedGroup(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupPrivacy: {
    color: '#666',
    fontStyle: 'italic',
  },
  groupDescription: {
    marginBottom: 10,
    color: '#555',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  privacyLabel: {
    marginRight: 10,
  },
  privacyOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginRight: 10,
  },
  selectedPrivacy: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  createButtonModal: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupDetailDescription: {
    marginBottom: 15,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  memberList: {
    marginBottom: 15,
    color: '#555',
  },
  activityText: {
    color: '#777',
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Hive;
