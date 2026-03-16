import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import VoiceInput from '../../components/VoiceInput';
import { naturalLanguageQuery } from '../../lib/ai';
import { useStore } from '../../store/useStore';

const QueryScreen = () => {
  const [voiceInput, setVoiceInput] = useState('');
  const [results, setResults] = useState([]);
  const { currentDb } = useStore();

  const handleVoiceInput = async (input) => {
    setVoiceInput(input);
    const sql = await naturalLanguageQuery(input, currentDb.schema);
    const rows = await queryRows(currentDb.id, sql);
    setResults(rows);
  };

  return (
    <View style={styles.container}>
      <VoiceInput onTranscription={handleVoiceInput} />
      <TextInput
        style={styles.input}
        placeholder="Ask a question"
        value={voiceInput}
        onChangeText={setVoiceInput}
      />
      <Button title="Search" onPress={() => handleVoiceInput(voiceInput)} />
      <FlatList
        data={results}
        renderItem={({ item }) => <Text>{JSON.stringify(item)}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
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

export default QueryScreen;
