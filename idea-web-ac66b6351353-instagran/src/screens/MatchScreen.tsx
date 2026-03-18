import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { getMatchingScore } from '../utils/matching';
import { useUser } from '../context/UserContext';
import { generateMockUsers, MockUser } from '../utils/mockUsers';

type MatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchScreen'>;

type Props = {
  navigation: MatchScreenNavigationProp;
};

interface MatchedUser extends MockUser {
  matchScore: number;
}

const MatchScreen = ({ navigation }: Props) => {
  const { currentUser } = useUser();
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const generateMatches = () => {
    if (!currentUser) return;

    const mockUsers = generateMockUsers(25);
    
    const usersWithScores: MatchedUser[] = mockUsers
      .map(user => ({
        ...user,
        matchScore: getMatchingScore({ hobbies: currentUser.hobbies }, user)
      }))
      .filter(user => user.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    setMatches(usersWithScores);
  };

  useEffect(() => {
    generateMatches();
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    generateMatches();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleMatch = (user: MockUser) => {
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

  if (matches.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No matches found</Text>
        <Text style={styles.emptySubtext}>
          Try adding more hobbies to your profile or refresh to see new users
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRefresh}
        >
          <Text style={styles.buttonText}>Refresh Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Top Matches</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.hobbies}>{item.hobbies.join(', ')}</Text>
              <Text style={styles.score}>Match Score: {item.matchScore}%</Text>
            </View>
            <TouchableOpacity 
              style={styles.matchButton}
              onPress={() => handleMatch(item)}
            >
              <Text style={styles.matchButtonText}>Connect</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
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
