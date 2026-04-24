import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
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

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  groupId: string;
  createdAt: Date;
  completedBy?: string[];
}

interface User {
  id: string;
  displayName: string;
  email: string;
}

const GroupDetail: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId } = route.params as { groupId: string };
  const [group, setGroup] = useState<Group | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    xpReward: 0
  });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch group details
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
          setGroup(groupData);

          // Check if current user is admin
          const currentUser = auth.currentUser;
          if (currentUser && groupData.adminId === currentUser.uid) {
            setIsAdmin(true);
          }

          // Fetch challenges for this group
          const challengesQuery = query(
            collection(db, 'challenges'),
            where('groupId', '==', groupId)
          );
          const challengesSnapshot = await getDocs(challengesQuery);
          const challengesData = challengesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Challenge[];
          setChallenges(challengesData);

          // Fetch member details
          const memberPromises = groupData.members.map(async (memberId) => {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
          });

          const membersData = (await Promise.all(memberPromises)).filter(Boolean) as User[];
          setMembers(membersData);
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
        Alert.alert('Error', 'Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const handleCreateChallenge = async () => {
    if (!newChallenge.title || !newChallenge.description || newChallenge.xpReward <= 0) {
      Alert.alert('Error', 'Please fill all fields with valid values');
      return;
    }

    try {
      await addDoc(collection(db, 'challenges'), {
        ...newChallenge,
        groupId,
        createdAt: serverTimestamp(),
        completedBy: []
      });

      // Refresh challenges
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('groupId', '==', groupId)
      );
      const challengesSnapshot = await getDocs(challengesQuery);
      const challengesData = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      setChallenges(challengesData);

      setShowChallengeModal(false);
      setNewChallenge({ title: '', description: '', xpReward: 0 });
      Alert.alert('Success', 'Challenge created successfully!');
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', 'Failed to create challenge');
    }
  };

  const handleToggleChallengeCompletion = async (challengeId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeRef);

      if (challengeDoc.exists()) {
        const challengeData = challengeDoc.data() as Challenge;
        const isCompleted = challengeData.completedBy?.includes(currentUser.uid);

        if (isCompleted) {
          // Remove completion
          await updateDoc(challengeRef, {
            completedBy: arrayRemove(currentUser.uid)
          });
        } else {
          // Add completion
          await updateDoc(challengeRef, {
            completedBy: arrayUnion(currentUser.uid)
          });
        }

        // Refresh challenges
        const challengesQuery = query(
          collection(db, 'challenges'),
          where('groupId', '==', groupId)
        );
        const challengesSnapshot = await getDocs(challengesQuery);
        const challengesData = challengesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Challenge[];
        setChallenges(challengesData);
      }
    } catch (error) {
      console.error('Error toggling challenge completion:', error);
      Alert.alert('Error', 'Failed to update challenge status');
    }
  };

  const handleDeleteChallenge = async () => {
    if (!challengeToDelete) return;

    try {
      await deleteDoc(doc(db, 'challenges', challengeToDelete));

      // Refresh challenges
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('groupId', '==', groupId)
      );
      const challengesSnapshot = await getDocs(challengesQuery);
      const challengesData = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      setChallenges(challengesData);

      setShowDeleteConfirm(false);
      setChallengeToDelete(null);
      Alert.alert('Success', 'Challenge deleted successfully!');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      Alert.alert('Error', 'Failed to delete challenge');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group) return;

    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayRemove(memberId)
      });

      // Refresh members
      const memberPromises = group.members.filter(id => id !== memberId).map(async (memberId) => {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
      });

      const membersData = (await Promise.all(memberPromises)).filter(Boolean) as User[];
      setMembers(membersData);

      Alert.alert('Success', 'Member removed successfully!');
    } catch (error) {
      console.error('Error removing member:', error);
      Alert.alert('Error', 'Failed to remove member');
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayRemove(currentUser.uid)
      });

      Alert.alert('Success', 'You left the group');
      navigation.goBack();
    } catch (error) {
      console.error('Error leaving group:', error);
      Alert.alert('Error', 'Failed to leave group');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Group not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>
          <View style={styles.groupInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={styles.infoText}>{members.length} members</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="lock-closed" size={16} color="#666" />
              <Text style={styles.infoText}>{group.privacy}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Challenges</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowChallengeModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {challenges.length === 0 ? (
            <Text style={styles.emptyText}>No challenges yet. {isAdmin ? 'Add one!' : 'Ask the admin to add some.'}</Text>
          ) : (
            <FlatList
              data={challenges}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const currentUser = auth.currentUser;
                const isCompleted = currentUser && item.completedBy?.includes(currentUser.uid);

                return (
                  <View style={styles.challengeItem}>
                    <View style={styles.challengeHeader}>
                      <Text style={styles.challengeTitle}>{item.title}</Text>
                      <Text style={styles.challengeXP}>{item.xpReward} XP</Text>
                    </View>
                    <Text style={styles.challengeDescription}>{item.description}</Text>
                    <View style={styles.challengeActions}>
                      <TouchableOpacity
                        style={[
                          styles.completeButton,
                          isCompleted && styles.completedButton
                        ]}
                        onPress={() => handleToggleChallengeCompletion(item.id)}
                      >
                        <Text style={styles.completeButtonText}>
                          {isCompleted ? 'Completed' : 'Mark Complete'}
                        </Text>
                      </TouchableOpacity>
                      {isAdmin && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => {
                            setChallengeToDelete(item.id);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#F44336" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              }}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowMemberModal(true)}
              >
                <Ionicons name="person-add" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {members.length === 0 ? (
            <Text style={styles.emptyText}>No members yet</Text>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.displayName?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.memberName}>{item.displayName || 'Anonymous'}</Text>
                      <Text style={styles.memberEmail}>{item.email}</Text>
                    </View>
                  </View>
                  {isAdmin && item.id !== group.adminId && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveMember(item.id)}
                    >
                      <Ionicons name="close" size={20} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.actionButtons}>
          {isAdmin ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => Alert.alert(
                'Delete Group',
                'Are you sure you want to delete this group? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                      await deleteDoc(doc(db, 'groups', group.id));
                      Alert.alert('Success', 'Group deleted successfully');
                      navigation.goBack();
                    } catch (error) {
                      console.error('Error deleting group:', error);
                      Alert.alert('Error', 'Failed to delete group');
                    }
                  }}
                ]
              )}
            >
              <Text style={styles.actionButtonText}>Delete Group</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleLeaveGroup}
            >
              <Text style={styles.actionButtonText}>Leave Group</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showChallengeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChallengeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Challenge</Text>

            <TextInput
              style={styles.input}
              placeholder="Challenge Title"
              value={newChallenge.title}
              onChangeText={(text) => setNewChallenge({...newChallenge, title: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={newChallenge.description}
              onChangeText={(text) => setNewChallenge({...newChallenge, description: text})}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="XP Reward"
              value={newChallenge.xpReward.toString()}
              onChangeText={(text) => setNewChallenge({...newChallenge, xpReward: parseInt(text) || 0})}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChallengeModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Delete Challenge</Text>
            <Text style={styles.confirmModalText}>Are you sure you want to delete this challenge?</Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.dangerButton]}
                onPress={handleDeleteChallenge}
              >
                <Text style={styles.confirmModalButtonText}>Delete</Text>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  groupInfo: {
    flexDirection: 'row',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#6200EE',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  challengeItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  challengeXP: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  challengeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  completedButton: {
    backgroundColor: '#8BC34A',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  actionButtons: {
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
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
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModalContent: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  confirmModalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupDetail;
