import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import VoiceInput from '../../components/VoiceInput';
import { generateSchema } from '../../lib/ai';
import { useStore } from '../../store/useStore';

const CreateDatabaseScreen = () => {
  const [voiceInput, setVoiceInput] = useState('');
  const [schema, setSchema] = useState([]);
  const [databaseName, setDatabaseName] = useState('');
  const { addDatabase } = useStore();

  const handleVoiceInput = async (input) => {
    setVoiceInput(input);
    const generatedSchema = await generateSchema(input);
    setSchema(generatedSchema);
  };

  const handleCreateDatabase = () => {
    addDatabase({ name: databaseName, schema });
  };

  return (
    <View style={styles.container}>
      <VoiceInput onTranscription={handleVoiceInput} />
      <TextInput
        style={styles.input}
        placeholder="Database Name"
        value={databaseName}
        onChangeText={setDatabaseName}
      />
      <Text>Generated Schema:</Text>
      {schema.map((field, index) => (
        <Text key={index}>{field.name} ({field.type})</Text>
      ))}
      <Button title="Create Database" onPress={handleCreateDatabase} />
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

export default CreateDatabaseScreen;
