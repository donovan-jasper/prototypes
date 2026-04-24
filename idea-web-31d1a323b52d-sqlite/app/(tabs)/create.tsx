import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, ActivityIndicator, Card, Text, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import VoiceInput from '../../components/VoiceInput';
import { parseVoiceCommand } from '../../lib/ai';
import { createDatabase } from '../../lib/database';
import { useStore } from '../../lib/store';

export default function CreateScreen() {
  const [transcription, setTranscription] = useState('');
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState<{name: string, type: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { addDatabase } = useStore();
  const router = useRouter();

  const handleVoiceInput = (text: string) => {
    setTranscription(text);
    try {
      const parsed = parseVoiceCommand(text);
      if (parsed.action === 'create' && parsed.tableName && parsed.fields) {
        setTableName(parsed.tableName);
        setFields(parsed.fields.map(f => ({
          name: f.name,
          type: f.type || 'TEXT' // Default to TEXT if not specified
        })));
        setShowPreview(true);
      } else {
        setError('Could not parse voice command. Please try again.');
        setSnackbarVisible(true);
      }
    } catch (err) {
      setError('Error processing voice command. Please try again.');
      setSnackbarVisible(true);
    }
  };

  const handleCreateDatabase = async () => {
    if (!tableName || fields.length === 0) {
      setError('Please provide a table name and at least one field');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      await createDatabase(tableName, fields);
      addDatabase({ name: tableName, fields, rowCount: 0 });
      router.push('/');
    } catch (error) {
      setError('Failed to create database. Please try again.');
      setSnackbarVisible(true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    setFields([...fields, { name: '', type: 'TEXT' }]);
  };

  const updateField = (index: number, field: {name: string, type: string}) => {
    const newFields = [...fields];
    newFields[index] = field;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Create Database</Text>

        <VoiceInput
          onResult={handleVoiceInput}
          placeholder="Say: 'Create customer database with name, email, and phone number'"
        />

        {transcription && (
          <Card style={styles.transcriptionCard}>
            <Card.Content>
              <Text variant="bodyMedium">You said:</Text>
              <Text variant="bodyLarge" style={styles.transcriptionText}>{transcription}</Text>
            </Card.Content>
          </Card>
        )}

        {showPreview && (
          <Card style={styles.previewCard}>
            <Card.Title title="Database Preview" />
            <Card.Content>
              <Text variant="labelLarge">Table Name:</Text>
              <TextInput
                value={tableName}
                onChangeText={setTableName}
                style={styles.input}
              />

              <Text variant="labelLarge" style={styles.fieldsLabel}>Fields:</Text>
              {fields.map((field, index) => (
                <View key={index} style={styles.fieldRow}>
                  <TextInput
                    label="Field Name"
                    value={field.name}
                    onChangeText={(text) => updateField(index, { ...field, name: text })}
                    style={styles.fieldInput}
                  />
                  <TextInput
                    label="Type"
                    value={field.type}
                    onChangeText={(text) => updateField(index, { ...field, type: text })}
                    style={styles.fieldInput}
                  />
                  <Button
                    icon="delete"
                    onPress={() => removeField(index)}
                    style={styles.deleteButton}
                  />
                </View>
              ))}

              <Button
                icon="plus"
                mode="outlined"
                onPress={addField}
                style={styles.addButton}
              >
                Add Field
              </Button>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={handleCreateDatabase}
          disabled={loading || !tableName || fields.length === 0}
          style={styles.createButton}
        >
          {loading ? <ActivityIndicator color="#fff" /> : 'Create Database'}
        </Button>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error}
        </Snackbar>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  transcriptionCard: {
    marginVertical: 16,
  },
  transcriptionText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  previewCard: {
    marginVertical: 16,
  },
  input: {
    marginVertical: 8,
  },
  fieldsLabel: {
    marginTop: 16,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldInput: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
  addButton: {
    marginTop: 16,
  },
  createButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});
