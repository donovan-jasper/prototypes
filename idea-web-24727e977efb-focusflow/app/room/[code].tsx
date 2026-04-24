import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRoomStatus, leaveRoom, pollRoomUpdates } from '../../lib/room-manager';
import { useStore } from '../../store/useStore';
import * as Notifications from 'expo-notifications';

export default function RoomScreen() {
  const { code } = useLocalSearchParams();
  const [roomStatus, setRoomStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { activeRoom, updateRoomStatus } = useStore();
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const status = await getRoomStatus(code);
        setRoomStatus(status);
        setTimeLeft(status.duration * 60); // Convert to seconds
        updateRoomStatus(status);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching room status:', error);
        setError('Failed to load room status');
        setLoading(false);
      }
    };

    fetchRoomStatus();

    // Set up polling every 5 seconds
    const stopPolling = pollRoomUpdates(code, (status) => {
      setRoomStatus(status);
      updateRoomStatus(status);
    });

    // Set up timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      stopPolling();
      clearInterval(timerRef.current);
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
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
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
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
