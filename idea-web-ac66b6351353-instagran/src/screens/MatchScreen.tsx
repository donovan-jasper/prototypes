import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { getMatchingScore } from '../utils/matching';
import { useUser } from '../context/UserContext';

type MatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchScreen'>;

type Props = {
  navigation: MatchScreenNavigationProp;
};

const MatchScreen = ({ navigation }: Props) => {
  const { currentUser } = useUser();
  const [users, setUsers] = useState<Array<{ id: string; name: string; hobbies: string[] }>>([]);

  useEffect(() => {
    const mockUsers = [
      { id: '1', name: 'Alice', hobbies: ['hiking', 'reading', 'photography'] },
      { id: '2', name: 'Bob', hobbies: ['reading', 'cooking', 'gardening'] },
      { id: '3', name: 'Carol', hobbies: ['hiking', 'yoga', 'painting'] },
      { id: '4', name: 'David', hobbies: ['cooking', 'music', 'travel'] },
    ];
    setUsers(mockUsers);
  }, []);

  const handleMatch = (user: { id: string; name: string; hobbies: string[] }) => {
    navigation.navigate('EventScreen', { user });
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Please create your profile first</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.buttonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Potential Matches</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const score = getMatchingScore({ hobbies: currentUser.hobbies }, item);
          return (
            <View style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.hobbies}>{item.hobbies.join(', ')}</Text>
                <Text style={styles.score}>Match Score: {score}%</Text>
              </View>
              <TouchableOpacity 
                style={styles.matchButton}
                onPress={() => handleMatch(item)}
              >
                <Text style={styles.matchButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          );
        }}
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
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  hobbies: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  score: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  matchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MatchScreen;
