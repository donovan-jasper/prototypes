import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

interface Group {
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  members: string[];
  createdAt: Date;
  adminId: string;
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

    if (newGroup.name.length > 30) {
      Alert.alert('Error', 'Group name must be 30 characters or less');
      return;
    }

    if (newGroup.description.length > 140) {
      Alert.alert('Error', 'Description must be 140 characters or less');
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
        adminId: user.uid,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'groups'), groupData);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', privacy: 'public' });
      Alert.alert('Success', 'Group created successfully!');
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
        if (group.privacy === 'private') {
          Alert.alert('Private Group', 'This group requires an invitation to join');
          return;
        }
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
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No groups found. Create one to get started!</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>Create New Group</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>SkillHive Groups</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
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
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={[
                styles.groupPrivacy,
                { color: item.privacy === 'public' ? '#4CAF50' : '#F44336' }
              ]}>
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
        contentContainerStyle={styles.listContent}
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
              maxLength={30}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={newGroup.description}
              onChangeText={(text) => setNewGroup({...newGroup, description: text})}
              multiline
              maxLength={140}
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
                <Text style={styles.privacyText}>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  newGroup.privacy === 'private' && styles.selectedPrivacy
                ]}
                onPress={() => setNewGroup({...newGroup, privacy: 'private'})}
              >
                <Text style={styles.privacyText}>Private</Text>
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
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
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
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  groupItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontWeight: '600',
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
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 16,
  },
  privacyOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedPrivacy: {
    backgroundColor: '#6200EE',
  },
  privacyText: {
    color: '#333',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#6200EE',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Hive;
