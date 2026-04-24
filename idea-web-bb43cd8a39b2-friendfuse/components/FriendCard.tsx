import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';

interface FriendCardProps {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  score: number;
}

const FriendCard: React.FC<FriendCardProps> = ({ id, name, avatar, streak, score }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/friend/${id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Avatar.Image size={50} source={{ uri: avatar }} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default FriendCard;
