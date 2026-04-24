import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Share, ActivityIndicator } from 'react-native';
import { useStore } from '../../store/useStore';
import { createRoom, joinRoom, getRoomStatus, connectToRoomSocket } from '../../lib/room-manager';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialIcons } from '@expo/vector-icons';

export default function TogetherScreen() {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [duration, setDuration] = useState('50');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const db = useSQLiteContext();
  const { setActiveRoom } = useStore();

  const createNewRoom = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const room = await createRoom(username, parseInt(duration));
      setActiveRoom({
        code: room.code,
        creator: room.creator,
        duration: room.duration,
        participants: [username],
        createdAt: room.createdAt,
        timeRemaining: room.duration
      });
      router.push(`/room/${room.code}`);
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const joinExistingRoom = async () => {
    if (!roomCode || !username) {
      Alert.alert('Error', 'Please enter room code and your name');
      return;
    }

    setLoading(true);
    try {
      const status = await joinRoom(roomCode, username);
      setActiveRoom({
        code: status.code,
        creator: status.creator || '',
        duration: status.duration,
        participants: status.participants,
        createdAt: status.createdAt,
        timeRemaining: status.timeRemaining
      });
      router.push(`/room/${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Error', 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveRooms = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM rooms ORDER BY created_at DESC LIMIT 5');
      setRooms(result);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  useEffect(() => {
    loadActiveRooms();
  }, []);

  const shareRoomLink = async (code) => {
    try {
      const result = await Share.share({
        message: `Join my focus room: ${code}\n\nDownload ZenBlock to focus together!`,
        url: `https://zenblock.app/room/${code}`
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share room');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Together</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create a Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (minutes)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={createNewRoom}
          disabled={loading || !username}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Room</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join a Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Room code"
          value={roomCode}
          onChangeText={setRoomCode}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={joinExistingRoom}
          disabled={loading || !roomCode || !username}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Join Room</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Rooms</Text>
        {rooms.length > 0 ? (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <View style={styles.roomCard}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomCode}>{item.code}</Text>
                  <Text style={styles.roomDuration}>{item.duration} min</Text>
                </View>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => shareRoomLink(item.code)}
                >
                  <MaterialIcons name="share" size={20} color="#6200ee" />
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noRoomsText}>No active rooms yet</Text>
        )}
      </View>
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
    textAlign: 'center',
    color: '#6200ee',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roomInfo: {
    flex: 1,
  },
  roomCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  roomDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  shareButton: {
    padding: 10,
  },
  noRoomsText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});
