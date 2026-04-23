import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import VoiceInput from '../../components/VoiceInput';
import { generateSchema } from '../../lib/ai';
import { createDatabase } from '../../lib/db';
import { useStore } from '../../store/useStore';
import { useRouter } from 'expo-router';
import { Field } from '../../lib/schema';

const CreateDatabaseScreen = () => {
  const [voiceInput, setVoiceInput] = useState('');
  const [schema, setSchema] = useState<Field[]>([]);
  const [databaseName, setDatabaseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addDatabase } = useStore();
  const router = useRouter();

  const handleVoiceInput = async (input: string) => {
    setVoiceInput(input);
    if (!input.trim()) {
      setSchema([]);
      return;
    }
    setIsLoading(true);
    try {
      const generatedSchema = await generateSchema(input);
      setSchema(generatedSchema);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate schema. Please try again.');
      console.error('Schema generation error:', error);
      setSchema([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDatabase = async () => {
    if (!databaseName.trim()) {
      Alert.alert('Error', 'Please enter a database name.');
      return;
    }
    if (schema.length === 0) {
      Alert.alert('Error', 'Please generate a schema first using voice input or add fields manually.');
      return;
    }

    setIsLoading(true);
    try {
      const newDb = await createDatabase(databaseName, schema);
      addDatabase(newDb);
      Alert.alert('Success', `Database "${newDb.name}" created!`);
      router.push(`/database/${newDb.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create database. Please try again.');
      console.error('Database creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Database</Text>

      <VoiceInput onTranscription={handleVoiceInput} />

      <TextInput
        style={styles.input}
        placeholder="Enter a name for your database"
        value={databaseName}
        onChangeText={setDatabaseName}
        editable={!isLoading}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6200ee" />
          <Text style={styles.loadingText}>Generating schema...</Text>
        </View>
      )}

      {schema.length > 0 && (
        <View style={styles.schemaPreview}>
          <Text style={styles.schemaTitle}>Generated Schema Preview:</Text>
          {schema.map((field, index) => (
            <Text key={index} style={styles.schemaField}>
              • {field.name} ({field.type})
            </Text>
          ))}
        </View>
      )}

      <Button
        title="Create Database"
        onPress={handleCreateDatabase}
        disabled={!databaseName.trim() || schema.length === 0 || isLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  schemaPreview: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f0ff',
  },
  schemaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  schemaField: {
    fontSize: 15,
    marginBottom: 4,
    color: '#555',
  },
});

export default CreateDatabaseScreen;
