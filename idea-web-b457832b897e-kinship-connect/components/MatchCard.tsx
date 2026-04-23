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
      activeOpacity={0.8}
      testID="match-card"
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: match.photo }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {match.name}, <Text style={styles.age}>{match.age}</Text>
          </Text>
          <View style={styles.scoreContainer}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
            <Text style={styles.score}>{match.compatibilityScore}%</Text>
          </View>
        </View>

        <Text style={styles.distance}>
          {match.distance.toFixed(1)} miles away
        </Text>

        <View style={styles.interestsContainer}>
          {match.interests.slice(0, 3).map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
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
  imageContainer: {
    height: 200,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  age: {
    fontWeight: '400',
    color: '#666',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  score: {
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    color: '#444',
  },
});

export default MatchCard;
