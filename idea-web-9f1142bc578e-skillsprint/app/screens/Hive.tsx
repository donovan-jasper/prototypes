import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { firebase } from '../../firebaseConfig';
import { useAuth } from '../../utils/auth';

const Hive = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = firebase.firestore()
      .collection('groups')
      .onSnapshot(snapshot => {
        const groupsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGroups(groupsData);
      });

    return () => unsubscribe();
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    setLoading(true);
    try {
      await firebase.firestore().collection('groups').add({
        name: groupName.trim(),
        members: [user.uid],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid
      });
      setGroupName('');
      Alert.alert('Success', 'Group created successfully');
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a group');
      return;
    }

    setLoading(true);
    try {
      const groupRef = firebase.firestore().collection('groups').doc(groupId);
      await groupRef.update({
        members: firebase.firestore.FieldValue.arrayUnion(user.uid)
      });
      Alert.alert('Success', 'Joined group successfully');
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to leave a group');
      return;
    }

    setLoading(true);
    try {
      const groupRef = firebase.firestore().collection('groups').doc(groupId);
      await groupRef.update({
        members: firebase.firestore.FieldValue.arrayRemove(user.uid)
      });
      Alert.alert('Success', 'Left group successfully');
    } catch (error) {
      console.error('Error leaving group:', error);
      Alert.alert('Error', 'Failed to leave group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMember = (group) => {
    return group.members && group.members.includes(user?.uid);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkillHive Groups</Text>

      <View style={styles.createGroup}>
        <TextInput
          style={styles.input}
          placeholder="New group name"
          value={groupName}
          onChangeText={setGroupName}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={createGroup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Group</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupMembers}>{item.members?.length || 0} members</Text>
            {isMember(item) ? (
              <TouchableOpacity
                style={[styles.button, styles.leaveButton]}
                onPress={() => leaveGroup(item.id)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Leave Group</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => joinGroup(item.id)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Join Group</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
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
    color: '#333',
  },
  createGroup: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  groupItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupMembers: {
    color: '#666',
    marginBottom: 10,
  },
});

export default Hive;
