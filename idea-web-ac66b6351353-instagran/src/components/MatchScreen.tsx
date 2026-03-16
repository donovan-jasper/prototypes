import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getMatchingScore } from '../utils/matching';

const MatchScreen = () => {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch users from Firebase
    const mockUsers = [
      { id: '1', name: 'Alice', hobbies: ['hiking', 'reading'] },
      { id: '2', name: 'Bob', hobbies: ['reading', 'cooking'] },
    ];
    setUsers(mockUsers);
  }, []);

  const handleMatch = (user) => {
    // Navigate to event screen with matched user
    navigation.navigate('EventScreen', { user });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Potential Matches</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name}</Text>
            <Text>Matching Score: {getMatchingScore({ hobbies: ['hiking', 'reading'] }, item)}%</Text>
            <Button title="Match" onPress={() => handleMatch(item)} />
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
});

export default MatchScreen;
