import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChallengeCard = ({ title, description, bestScore, premium, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {bestScore && <Text style={styles.score}>Best: {bestScore}</Text>}
      </View>
      {premium && (
        <View style={styles.premiumBadge}>
          <Ionicons name="lock-closed" size={16} color="#FFD700" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  score: {
    fontSize: 14,
    color: '#007AFF',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  premiumText: {
    color: '#FFD700',
    marginLeft: 5,
  },
});

export default ChallengeCard;
