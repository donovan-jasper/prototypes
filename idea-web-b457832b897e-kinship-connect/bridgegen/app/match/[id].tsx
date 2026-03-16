import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const MatchDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        // Mock API call
        const mockMatch = {
          id: id,
          name: 'Margaret Smith',
          age: 72,
          photo: 'https://example.com/margaret.jpg',
          bio: 'I love cooking and gardening. I would love to share my knowledge with someone.',
          interests: ['cooking', 'gardening', 'reading'],
          distance: 5.2,
          compatibilityScore: 85,
        };
        setMatch(mockMatch);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>Error: {error.message}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: match.photo }} style={styles.image} />
      <Text style={styles.name}>{match.name}</Text>
      <Text style={styles.age}>{match.age}</Text>
      <Text style={styles.distance}>{match.distance} miles away</Text>
      <Text style={styles.compatibility}>Compatibility: {match.compatibilityScore}%</Text>
      <Text style={styles.bio}>{match.bio}</Text>
      <Text style={styles.interests}>Interests: {match.interests.join(', ')}</Text>
      <Button title="Send Connection Request" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    marginBottom: 10,
  },
  age: {
    fontSize: 18,
    marginBottom: 10,
  },
  distance: {
    fontSize: 16,
    marginBottom: 10,
  },
  compatibility: {
    fontSize: 16,
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  interests: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default MatchDetailScreen;
