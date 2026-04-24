import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RoomCardProps {
  code: string;
  duration: number;
  participantCount: number;
  onPress: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ code, duration, participantCount, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.duration}>{duration} minutes</Text>
      </View>
      <View style={styles.participantsContainer}>
        <MaterialIcons name="people" size={20} color="#666" />
        <Text style={styles.participantCount}>{participantCount}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  infoContainer: {
    flex: 1,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 2,
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 5,
  },
});

export default RoomCard;
