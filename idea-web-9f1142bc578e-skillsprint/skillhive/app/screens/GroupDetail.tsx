import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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
        createdAt: serverTimestamp()
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupPrivacy}>
          {group.privacy === 'public' ? 'Public Group' : 'Private Group'}
        </Text>
        <Text style={styles.groupDescription}>{group.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members ({members.length})</Text>
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <Text style={styles.memberName}>{item.displayName || item.email}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No members yet</Text>
          }
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Group Challenges</Text>
          {isAdmin && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowChallengeModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Challenge</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.challengeItem}>
              <Text style={styles.challengeTitle}>{item.title}</Text>
              <Text style={styles.challengeDescription}>{item.description}</Text>
              <Text style={styles.challengeXP}>XP: {item.xpReward}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No challenges yet</Text>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Groups</Text>
      </TouchableOpacity>

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
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: '#666',
  },
  header: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  groupPrivacy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 16,
    color: '#444',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  memberItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  challengeItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  challengeXP: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: 'bold',
  },
  emptyListText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
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
    marginTop: 20,
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
  createButton: {
    backgroundColor: '#6200EE',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupDetail;
