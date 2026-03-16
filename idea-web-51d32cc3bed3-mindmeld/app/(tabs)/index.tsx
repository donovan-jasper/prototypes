import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useReminders } from '../../store/reminders';
import ReminderCard from '../../components/ReminderCard';

export default function HomeScreen() {
  const router = useRouter();
  const { reminders, fetchReminders } = useReminders();

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Tasks</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReminderCard reminder={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No reminders yet</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-reminder')}
      >
        <Text style={styles.fabText}>+</Text>
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
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
  },
});
