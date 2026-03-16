import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useMemoryStore } from '../store/memoryStore';
import { useRouter } from 'expo-router';

const AddMemoryScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { addMemory } = useMemoryStore();
  const router = useRouter();

  const handleAddMemory = () => {
    addMemory({
      title,
      description,
      trigger_type: 'time',
      trigger_value: new Date().toISOString(),
      completed: false,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Add Memory" onPress={handleAddMemory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
});

export default AddMemoryScreen;
