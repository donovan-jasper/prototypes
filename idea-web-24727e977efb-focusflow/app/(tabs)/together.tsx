import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import { createRoom, joinRoom, getRoomStatus } from '../../lib/room-manager';
import { useRouter } from 'expo-router';

export default function TogetherScreen() {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createNewRoom = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const room = await createRoom(username, 50); // Default 50 min duration
      router.push(`/room/${room.code}`);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinExistingRoom = async () => {
    if (!roomCode || !username) return;
    setLoading(true);
    try {
      await joinRoom(roomCode, username);
      router.push(`/room/${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      // In a real app, this would fetch active rooms from the server
      // For now, we'll just show a sample room
      setRooms([{ code: 'ABC123', participants: 2, duration: 50 }]);
    };
    fetchRooms();
  }, []);

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
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={createNewRoom}
          disabled={loading || !username}
        >
          <Text style={styles.buttonText}>Create Room</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join a Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Room code"
          value={roomCode}
          onChangeText={setRoomCode}
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
          <Text style={styles.buttonText}>Join Room</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Rooms</Text>
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() => router.push(`/room/${item.code}`)}
            >
              <Text style={styles.roomCode}>Room: {item.code}</Text>
              <Text>Participants: {item.participants}</Text>
              <Text>Duration: {item.duration} minutes</Text>
            </TouchableOpacity>
          )}
        />
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
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  roomCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  roomCode: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
