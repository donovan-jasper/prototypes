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
        const completedBy = challengeData.completedBy || [];

        if (completedBy.includes(currentUser.uid)) {
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

  const renderChallengeItem = ({ item }: { item: Challenge }) => {
    const currentUser = auth.currentUser;
    const isCompleted = currentUser && item.completedBy?.includes(currentUser.uid);

    return (
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => {
                setChallengeToDelete(item.id);
                setShowDeleteConfirm(true);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ff5252" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.challengeDescription}>{item.description}</Text>
        <View style={styles.challengeFooter}>
          <View style={styles.xpContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.xpText}>{item.xpReward} XP</Text>
          </View>
          <TouchableOpacity
            style={[styles.completeButton, isCompleted && styles.completedButton]}
            onPress={() => handleToggleChallengeCompletion(item.id)}
          >
            <Text style={styles.completeButtonText}>
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMemberItem = ({ item }: { item: User }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberName}>{item.displayName || 'Anonymous'}</Text>
      {isAdmin && item.id !== auth.currentUser?.uid && (
        <TouchableOpacity
          onPress={() => {
            setSelectedMember(item);
            setShowMemberModal(true);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

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
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={[styles.privacyBadge, group.privacy === 'public' ? styles.publicBadge : styles.privateBadge]}>
            <Text style={styles.privacyText}>{group.privacy}</Text>
          </View>
        </View>

        <Text style={styles.description}>{group.description}</Text>

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

          {challenges.length > 0 ? (
            <FlatList
              data={challenges}
              renderItem={renderChallengeItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No challenges yet. {isAdmin ? 'Create one!' : 'Ask the admin to add some.'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members ({members.length})</Text>
          {members.length > 0 ? (
            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No members yet</Text>
          )}
        </View>
      </ScrollView>

      {/* Create Challenge Modal */}
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
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Member Options Modal */}
      <Modal
        visible={showMemberModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowMemberModal(false)}
      >
        <View style={styles.memberModalContainer}>
          <View style={styles.memberModalContent}>
            <Text style={styles.memberModalTitle}>Member Options</Text>
            <TouchableOpacity
              style={styles.memberOption}
              onPress={() => {
                if (selectedMember) {
                  handleRemoveMember(selectedMember.id);
                  setShowMemberModal(false);
                }
              }}
            >
              <Text style={styles.memberOptionText}>Remove Member</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.memberOption}
              onPress={() => setShowMemberModal(false)}
            >
              <Text style={styles.memberOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Challenge</Text>
            <Text style={styles.deleteModalText}>Are you sure you want to delete this challenge?</Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.deleteModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteButton]}
                onPress={handleDeleteChallenge}
              >
                <Text style={styles.deleteModalButtonText}>Delete</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  privacyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  publicBadge: {
    backgroundColor: '#e3f2fd',
  },
  privateBadge: {
    backgroundColor: '#f3e5f5',
  },
  privacyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  challengeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  completeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#6200EE',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
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
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  createButton: {
    backgroundColor: '#6200EE',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  memberModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    maxWidth: 300,
  },
  memberModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberOptionText: {
    fontSize: 16,
    color: '#333',
  },
  deleteModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteModalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#ff5252',
  },
  deleteModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GroupDetail;
