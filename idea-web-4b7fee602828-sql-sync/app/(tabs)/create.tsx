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
      // Auto-generate database name if empty
      if (!databaseName.trim()) {
        const nameFromInput = input.split(' ').slice(0, 3).join(' ');
        setDatabaseName(nameFromInput.charAt(0).toUpperCase() + nameFromInput.slice(1));
      }
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

  const handleAddField = () => {
    setSchema([...schema, { name: '', type: 'TEXT', description: '' }]);
  };

  const handleFieldChange = (index: number, field: Partial<Field>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...field };
    setSchema(newSchema);
  };

  const handleRemoveField = (index: number) => {
    const newSchema = [...schema];
    newSchema.splice(index, 1);
    setSchema(newSchema);
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
          <Text style={styles.schemaTitle}>Schema Preview:</Text>
          {schema.map((field, index) => (
            <View key={index} style={styles.fieldContainer}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Field name"
                value={field.name}
                onChangeText={(text) => handleFieldChange(index, { name: text })}
              />
              <TextInput
                style={[styles.fieldInput, styles.typeInput]}
                placeholder="Type"
                value={field.type}
                onChangeText={(text) => handleFieldChange(index, { type: text as Field['type'] })}
              />
              <Button
                title="Remove"
                onPress={() => handleRemoveField(index)}
                color="#f44336"
              />
            </View>
          ))}
          <Button
            title="Add Field"
            onPress={handleAddField}
            color="#4caf50"
          />
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6200ee',
  },
  schemaPreview: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  schemaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  typeInput: {
    width: 80,
  },
});

export default CreateDatabaseScreen;
