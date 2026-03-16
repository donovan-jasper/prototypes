import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { useStore } from '../../store/useStore';

const RoutinesScreen = () => {
  const [routines, setRoutines] = useState([]);
  const { isPremium } = useStore();

  useEffect(() => {
    // Fetch routines from database
    setRoutines([
      { id: '1', name: 'Basic Training', challenges: ['tap-timing', 'reaction-speed'] },
    ]);
  }, []);

  const createRoutine = () => {
    if (!isPremium) {
      console.log('Premium feature');
      return;
    }
    console.log('Create new routine');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.routineItem}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={createRoutine}>
        <Text style={styles.buttonText}>Create New Routine</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  routineItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default RoutinesScreen;
