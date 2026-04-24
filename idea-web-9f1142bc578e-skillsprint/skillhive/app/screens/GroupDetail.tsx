import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

  const handlePromoteMember = async (memberId: string) => {
    try {
      if (!group) return;

      await updateDoc(doc(db, 'groups', group.id), {
        adminId: memberId
      });

      // Refresh group data
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
        setGroup(groupData);
        setIsAdmin(groupData.adminId === auth.currentUser?.uid);
      }

      setShowMemberModal(false);
      Alert.alert('Success', 'Member promoted to admin');
    } catch (error) {
      console.error('Error promoting member:', error);
      Alert.alert('Error', 'Failed to promote member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      if (!group) return;

      await updateDoc(doc(db, 'groups', group.id), {
        members: arrayRemove(memberId)
      });

      // Refresh members
      const memberPromises = group.members.filter(id => id !== memberId).map(async (memberId) => {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
      });

      const membersData = (await Promise.all(memberPromises)).filter(Boolean) as User[];
      setMembers(membersData);

      setShowMemberModal(false);
      Alert.alert('Success', 'Member removed from group');
    } catch (error) {
      console.error('Error removing member:', error);
      Alert.alert('Error', 'Failed to remove member');
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Group not found</Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupPrivacy}>
          {group.privacy === 'public' ? 'Public Group' : 'Private Group'}
        </Text>
        <Text style={styles.groupDescription}>{group.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenges</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowChallengeModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Challenge</Text>
          </TouchableOpacity>
        )}

        {challenges.length > 0 ? (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.challengeItem}
                onPress={() => handleToggleChallengeCompletion(item.id)}
              >
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{item.title}</Text>
                  <Text style={styles.challengeXP}>{item.xpReward} XP</Text>
                </View>
                <Text style={styles.challengeDescription}>{item.description}</Text>
                <View style={styles.challengeStatus}>
                  <Text style={styles.challengeStatusText}>
                    {item.completedBy?.includes(auth.currentUser?.uid || '') ? 'Completed' : 'Not completed'}
                  </Text>
                  <Text style={styles.challengeCompletionCount}>
                    {item.completedBy?.length || 0} members completed
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptySectionText}>No challenges yet</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members ({members.length})</Text>
        {members.length > 0 ? (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.memberItem}
                onPress={() => {
                  if (isAdmin && item.id !== auth.currentUser?.uid) {
                    setSelectedMember(item);
                    setShowMemberModal(true);
                  }
                }}
              >
                <Text style={styles.memberName}>{item.displayName}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
                {group.adminId === item.id && (
                  <Text style={styles.adminBadge}>Admin</Text>
                )}
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptySectionText}>No members yet</Text>
        )}
      </View>

      {/* Challenge Creation Modal */}
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
              style={[styles.input, styles.multilineInput]}
              placeholder="Description"
              multiline
              numberOfLines={4}
              value={newChallenge.description}
              onChangeText={(text) => setNewChallenge({...newChallenge, description: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="XP Reward"
              keyboardType="numeric"
              value={newChallenge.xpReward.toString()}
              onChangeText={(text) => setNewChallenge({...newChallenge, xpReward: parseInt(text) || 0})}
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

      {/* Member Management Modal */}
      {selectedMember && (
        <Modal
          visible={showMemberModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMemberModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Manage Member</Text>
              <Text style={styles.memberModalName}>{selectedMember.displayName}</Text>

              <View style={styles.memberModalActions}>
                <TouchableOpacity
                  style={[styles.memberActionButton, styles.promoteButton]}
                  onPress={() => handlePromoteMember(selectedMember.id)}
                >
                  <Text style={styles.memberActionText}>Promote to Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.memberActionButton, styles.removeButton]}
                  onPress={() => handleRemoveMember(selectedMember.id)}
                >
                  <Text style={styles.memberActionText}>Remove from Group</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMemberModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupPrivacy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 16,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
  },
  challengeItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeXP: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  challengeStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeStatusText: {
    fontSize: 12,
    color: '#666',
  },
  challengeCompletionCount: {
    fontSize: 12,
    color: '#666',
  },
  memberItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: '#6200EE',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
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
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#6200EE',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  memberModalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  memberModalActions: {
    marginBottom: 20,
  },
  memberActionButton: {
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  promoteButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  memberActionText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
});

export default GroupDetail;
