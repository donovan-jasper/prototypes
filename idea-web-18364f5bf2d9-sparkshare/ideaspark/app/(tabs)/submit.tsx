import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createIdea } from '../../lib/ideas';

export default function SubmitSpark() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tech');

  const handleSubmit = async () => {
    await createIdea({ title, description, category });
    setTitle('');
    setDescription('');
    setCategory('tech');
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
        style={[styles.input, styles.description]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="Tech" value="tech" />
        <Picker.Item label="Food" value="food" />
        <Picker.Item label="Service" value="service" />
        <Picker.Item label="Product" value="product" />
      </Picker>
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  description: {
    height: 100,
  },
});
