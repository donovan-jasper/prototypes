import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import VoiceInput from '../../components/VoiceInput';
import QueryResults from '../../components/QueryResults';
import { generateSQL } from '../../lib/ai';
import { queryDatabase } from '../../lib/database';
import { useStore } from '../../lib/store';

export default function QueryScreen() {
  const [transcription, setTranscription] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentDatabase } = useStore();

  const handleVoiceInput = (text: string) => {
    setTranscription(text);
  };

  const handleQuery = async () => {
    setLoading(true);
    try {
      const sql = generateSQL(transcription, currentDatabase || '');
      const data = await queryDatabase(currentDatabase || '', sql);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <VoiceInput onTranscription={handleVoiceInput} />
      <Button
        mode="contained"
        onPress={handleQuery}
        disabled={loading}
        style={styles.button}
      >
        {loading ? <ActivityIndicator color="#fff" /> : 'Query'}
      </Button>
      <QueryResults results={results} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
});
