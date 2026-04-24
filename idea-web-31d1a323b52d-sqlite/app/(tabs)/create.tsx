import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, ActivityIndicator, Card, Text, Snackbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import VoiceInput from '../../components/VoiceInput';
import { parseVoiceCommand } from '../../lib/ai';
import { createDatabase } from '../../lib/database';
import { useStore } from '../../lib/store';

export default function CreateScreen() {
  const theme = useTheme();
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>Create Database</Text>

        <VoiceInput
          onResult={handleVoiceInput}
          placeholder="Say: 'Create customer database with name, email, and phone number'"
        />

        {transcription && (
          <Card style={[styles.transcriptionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>You said:</Text>
              <Text variant="bodyLarge" style={[styles.transcriptionText, { color: theme.colors.onSurface }]}>{transcription}</Text>
            </Card.Content>
          </Card>
        )}

        {showPreview && (
          <Card style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Title
              title="Database Preview"
              titleStyle={{ color: theme.colors.onSurface }}
            />
            <Card.Content>
              <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>Table Name:</Text>
              <TextInput
                value={tableName}
                onChangeText={setTableName}
                style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                theme={{ colors: { text: theme.colors.onSurface, placeholder: theme.colors.onSurfaceVariant } }}
              />

              <Text variant="labelLarge" style={[styles.fieldsLabel, { color: theme.colors.onSurface }]}>Fields:</Text>
              {fields.map((field, index) => (
                <View key={index} style={styles.fieldRow}>
                  <TextInput
                    label="Field Name"
                    value={field.name}
                    onChangeText={(text) => updateField(index, { ...field, name: text })}
                    style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceVariant }]}
                    theme={{ colors: { text: theme.colors.onSurface, placeholder: theme.colors.onSurfaceVariant } }}
                  />
                  <TextInput
                    label="Type"
                    value={field.type}
                    onChangeText={(text) => updateField(index, { ...field, type: text })}
                    style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceVariant }]}
                    theme={{ colors: { text: theme.colors.onSurface, placeholder: theme.colors.onSurfaceVariant } }}
                  />
                  <Button
                    icon="delete"
                    onPress={() => removeField(index)}
                    style={styles.deleteButton}
                    textColor={theme.colors.error}
                  />
                </View>
              ))}

              <Button
                icon="plus"
                mode="outlined"
                onPress={addField}
                style={styles.addButton}
                textColor={theme.colors.primary}
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
          loading={loading}
        >
          Create Database
        </Button>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: theme.colors.errorContainer }}
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
    padding: 8,
  },
  transcriptionText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  previewCard: {
    marginVertical: 16,
    padding: 8,
  },
  input: {
    marginVertical: 8,
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  createButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});
