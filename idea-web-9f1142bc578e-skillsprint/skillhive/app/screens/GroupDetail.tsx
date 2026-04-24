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
      setChallenges(challenges.filter(challenge => challenge.id !== challengeToDelete));
      setShowDeleteConfirm(false);
      setChallengeToDelete(null);
      Alert.alert('Success', 'Challenge deleted successfully!');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      Alert.alert('Error', 'Failed to delete challenge');
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
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.challengeDescription}>{item.description}</Text>
        <View style={styles.challengeFooter}>
          <Text style={styles.xpReward}>{item.xpReward} XP</Text>
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

  const renderMemberItem = ({ item }: { item: User }) => {
    const isCurrentUser = auth.currentUser?.uid === item.id;
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>
            {item.displayName ? item.displayName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.displayName || 'Anonymous'}</Text>
          {isCurrentUser && <Text style={styles.memberTag}>You</Text>}
        </View>
        {isAdmin && !isCurrentUser && (
          <TouchableOpacity
            onPress={() => {
              setSelectedMember(item);
              setShowMemberModal(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#6C63FF" />
          </TouchableOpacity>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={[styles.privacyBadge, group.privacy === 'public' ? styles.publicBadge : styles.privateBadge]}>
            <Text style={styles.privacyText}>{group.privacy}</Text>
          </View>
        </View>

        <Text style={styles.groupDescription}>{group.description}</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({members.length})</Text>
        </View>

        <FlatList
          data={members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.membersList}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Challenges</Text>
          {isAdmin && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowChallengeModal(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#6C63FF" />
            </TouchableOpacity>
          )}
        </View>

        {challenges.length > 0 ? (
          <FlatList
            data={challenges}
            renderItem={renderChallengeItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.challengesList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No challenges yet</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addChallengeButton}
                onPress={() => setShowChallengeModal(true)}
              >
                <Text style={styles.addChallengeButtonText}>Create First Challenge</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
              style={[styles.input, styles.descriptionInput]}
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

      {/* Member Actions Modal */}
      <Modal
        visible={showMemberModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowMemberModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowMemberModal(false)}
        >
          <View style={styles.memberModalContent}>
            <TouchableOpacity
              style={styles.memberAction}
              onPress={async () => {
                if (selectedMember) {
                  try {
                    await updateDoc(doc(db, 'groups', groupId), {
                      members: arrayRemove(selectedMember.id)
                    });
                    setMembers(members.filter(m => m.id !== selectedMember.id));
                    setShowMemberModal(false);
                    Alert.alert('Success', 'Member removed from group');
                  } catch (error) {
                    console.error('Error removing member:', error);
                    Alert.alert('Error', 'Failed to remove member');
                  }
                }
              }}
            >
              <Text style={styles.memberActionText}>Remove Member</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Challenge</Text>
            <Text style={styles.confirmText}>Are you sure you want to delete this challenge?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteChallenge}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
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
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  backButton: {
    marginRight: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  membersList: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  memberTag: {
    fontSize: 12,
    color: '#6C63FF',
    marginTop: 2,
  },
  challengesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  challengeCard: {
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
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
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
  xpReward: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  addChallengeButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addChallengeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
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
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '80%',
    padding: 16,
  },
  memberAction: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  memberActionText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default GroupDetail;
