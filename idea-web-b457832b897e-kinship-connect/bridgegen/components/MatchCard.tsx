import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const MatchCard = ({ match }) => {
  return (
    <TouchableOpacity style={styles.card} testID="match-card">
      <Link href={`/match/${match.id}`} asChild>
        <View style={styles.cardContent}>
          <Image source={{ uri: match.photo }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{match.name}</Text>
            <Text style={styles.age}>{match.age}</Text>
            <Text style={styles.distance}>{match.distance} miles away</Text>
            <Text style={styles.compatibility}>Compatibility: {match.compatibilityScore}%</Text>
            <Text style={styles.interests}>Interests: {match.interests.join(', ')}</Text>
          </View>
        </View>
      </Link>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  age: {
    fontSize: 16,
  },
  distance: {
    fontSize: 14,
    color: 'gray',
  },
  compatibility: {
    fontSize: 14,
    color: 'gray',
  },
  interests: {
    fontSize: 14,
    color: 'gray',
  },
});

export default MatchCard;
