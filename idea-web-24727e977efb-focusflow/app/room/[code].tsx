import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRoomStatus, leaveRoom, pollRoomUpdates } from '../../lib/room-manager';
import { useStore } from '../../store/useStore';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';

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
  const lastParticipantsRef = useRef([]);

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const status = await getRoomStatus(code);
        setRoomStatus(status);
        setTimeLeft(status.duration * 60); // Convert to seconds
        updateRoomStatus(status);
        lastParticipantsRef.current = status.participants;
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

      // Check for participant changes
      if (lastParticipantsRef.current.length !== status.participants.length) {
        const leftParticipants = lastParticipantsRef.current.filter(
          p => !status.participants.includes(p)
        );

        if (leftParticipants.length > 0) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Someone left the room",
              body: `${leftParticipants.join(', ')} has left the focus session`,
              sound: true,
            },
            trigger: null,
          });
        }
      }

      lastParticipantsRef.current = status.participants;
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
        <FlatList
          data={roomStatus.participants}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.participant}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.participantName}>{item}</Text>
            </View>
          )}
        />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6200ee',
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
    color: '#6200ee',
  },
  participant: {
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: 12,
    color: '#666',
  },
  leaveButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  leaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
