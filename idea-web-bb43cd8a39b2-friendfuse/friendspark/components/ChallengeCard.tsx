import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ChallengeCard = ({ challenge, onComplete }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{challenge.challenge_type || challenge.title}</Text>
        {challenge.premium && <Text style={styles.premium}>Pro</Text>}
      </View>
      <Text style={styles.description}>{challenge.description}</Text>
      {challenge.friend && (
        <Text style={styles.friend}>For: {challenge.friend.name}</Text>
      )}
      {challenge.status === 'active' && onComplete && (
        <TouchableOpacity style={styles.completeButton} onPress={() => onComplete(challenge.id)}>
          <Text style={styles.completeText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  premium: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginVertical: 5,
  },
  friend: {
    fontSize: 14,
    color: '#888',
  },
  completeButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  completeText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default ChallengeCard;
