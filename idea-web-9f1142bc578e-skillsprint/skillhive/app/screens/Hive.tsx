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

  const renderGroupItem = ({ item }: { item: Group }) => {
    const isMember = item.members.includes(auth.currentUser?.uid || '');
    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
      >
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.name}</Text>
          <View style={[styles.privacyBadge, item.privacy === 'public' ? styles.publicBadge : styles.privateBadge]}>
            <Text style={styles.privacyText}>{item.privacy}</Text>
          </View>
        </View>
        <Text style={styles.groupDescription}>{item.description}</Text>
        <View style={styles.groupFooter}>
          <Text style={styles.memberCount}>{item.members.length} members</Text>
          <TouchableOpacity
            style={[styles.joinButton, isMember ? styles.leaveButton : styles.joinButton]}
            onPress={() => handleJoinLeaveGroup(item)}
          >
            <Text style={styles.joinButtonText}>{isMember ? 'Leave' : 'Join'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SkillHive</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No groups found</Text>
          </View>
        }
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
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description"
              value={newGroup.description}
              onChangeText={(text) => setNewGroup({...newGroup, description: text})}
              multiline
              maxLength={140}
            />

            <View style={styles.privacyContainer}>
              <Text style={styles.privacyLabel}>Privacy:</Text>
              <TouchableOpacity
                style={[styles.privacyOption, newGroup.privacy === 'public' && styles.selectedPrivacy]}
                onPress={() => setNewGroup({...newGroup, privacy: 'public'})}
              >
                <Text style={styles.privacyOptionText}>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.privacyOption, newGroup.privacy === 'private' && styles.selectedPrivacy]}
                onPress={() => setNewGroup({...newGroup, privacy: 'private'})}
              >
                <Text style={styles.privacyOptionText}>Private</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  groupCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  privacyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publicBadge: {
    backgroundColor: '#E3F2FD',
  },
  privateBadge: {
    backgroundColor: '#F3E5F5',
  },
  privacyText: {
    fontSize: 12,
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
    fontSize: 12,
    color: '#999',
  },
  joinButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  leaveButton: {
    backgroundColor: '#FF6B6B',
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  descriptionInput: {
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedPrivacy: {
    backgroundColor: '#6C63FF',
  },
  privacyOptionText: {
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  createButton: {
    backgroundColor: '#6C63FF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default Hive;
