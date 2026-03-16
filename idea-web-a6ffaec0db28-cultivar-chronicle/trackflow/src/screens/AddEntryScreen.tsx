import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addEntry } from '../services/database';
import { useCategories } from '../hooks/useCategories';

const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { selectedCategoryId } = useCategories();
  const [note, setNote] = React.useState('');

  const handleAddEntry = async () => {
    await addEntry({
      categoryId: selectedCategoryId,
      note,
      photoUri: null,
      weather: null,
      temperature: null,
      location: null,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a note"
        value={note}
        onChangeText={setNote}
      />
      <Button title="Add Entry" onPress={handleAddEntry} />
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
    marginBottom: 16,
    padding: 8,
  },
});

export default AddEntryScreen;
