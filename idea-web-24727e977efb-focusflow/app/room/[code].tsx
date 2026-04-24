import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRoomStatus, leaveRoom } from '../../lib/room-manager';
import { useStore } from '../../store/useStore';

export default function RoomScreen() {
  const { code } = useLocalSearchParams();
  const [roomStatus, setRoomStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { activeSession } = useStore();

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const status = await getRoomStatus(code);
        setRoomStatus(status);
        setTimeLeft(status.duration * 60); // Convert to seconds
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room status:', error);
        Alert.alert('Error', 'Failed to load room status');
        router.back();
      }
    };

    fetchRoomStatus();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchRoomStatus, 5000);

    // Set up timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [code]);

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(code, 'currentUser'); // In a real app, use actual username
      router.back();
    } catch (error) {
      console.error('Error leaving room:', error);
      Alert.alert('Error', 'Failed to leave room');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading room...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Room: {code}</Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        <Text style={styles.timerLabel}>Time Remaining</Text>
      </View>

      <View style={styles.participantsContainer}>
        <Text style={styles.sectionTitle}>Participants ({roomStatus.participants.length})</Text>
        {roomStatus.participants.map((participant, index) => (
          <View key={index} style={styles.participant}>
            <Text>{participant}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.leaveButton}
        onPress={handleLeaveRoom}
      >
        <Text style={styles.leaveButtonText}>Leave Room</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
  },
  participantsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  participant: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  leaveButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
