import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MatchCardProps {
  match: {
    id: string;
    name: string;
    age: number;
    photo: string;
    interests: string[];
    distance: number;
    compatibilityScore: number;
  };
  onPress: (match: any) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(match)}
      testID="match-card"
    >
      <Image
        source={{ uri: match.photo }}
        style={styles.photo}
        resizeMode="cover"
      />

      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Text style={styles.name}>{match.name}</Text>
          <Text style={styles.age}>{match.age}</Text>
        </View>

        <Text style={styles.distance}>{match.distance} miles away</Text>

        <View style={styles.interestsContainer}>
          {match.interests.slice(0, 3).map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>

        <View style={styles.compatibilityContainer}>
          <Ionicons name="heart" size={16} color="#FF6B6B" />
          <Text style={styles.compatibilityText}>
            {match.compatibilityScore}% match
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photo: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  age: {
    fontSize: 18,
    color: '#666',
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  interestTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    color: '#555',
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilityText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default MatchCard;
