import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useReminders } from '../store/reminders';

export default function AddReminderScreen() {
  const [title, setTitle] = useState('');
  const { addReminder } = useReminders();
  const router = useRouter();

  const handleAddReminder = async () => {
    if (title.trim()) {
      await addReminder({
        id: Date.now().toString(),
        title,
        date: new Date().toISOString(),
        completed: false,
      });
      setTitle('');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Reminder title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <Button title="Add Reminder" onPress={handleAddReminder} />
      <Button title="Cancel" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
});
