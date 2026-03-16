import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import VoiceInput from '../../components/VoiceInput';
import { parseVoiceCommand } from '../../lib/ai';
import { createDatabase } from '../../lib/database';
import { useStore } from '../../lib/store';

export default function CreateScreen() {
  const [transcription, setTranscription] = useState('');
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addDatabase } = useStore();
  const router = useRouter();

  const handleVoiceInput = (text: string) => {
    setTranscription(text);
    const parsed = parseVoiceCommand(text);
    if (parsed.action === 'create') {
      setTableName(parsed.tableName);
      setFields(parsed.fields);
    }
  };

  const handleCreateDatabase = async () => {
    setLoading(true);
    try {
      await createDatabase(tableName, fields);
      addDatabase({ name: tableName, fields });
      router.push('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <VoiceInput onTranscription={handleVoiceInput} />
      <TextInput
        label="Table Name"
        value={tableName}
        onChangeText={setTableName}
        style={styles.input}
      />
      {fields.map((field, index) => (
        <TextInput
          key={index}
          label={`Field ${index + 1}`}
          value={field.name}
          onChangeText={(text) => {
            const newFields = [...fields];
            newFields[index].name = text;
            setFields(newFields);
          }}
          style={styles.input}
        />
      ))}
      <Button
        mode="contained"
        onPress={handleCreateDatabase}
        disabled={loading}
        style={styles.button}
      >
        {loading ? <ActivityIndicator color="#fff" /> : 'Create Database'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
