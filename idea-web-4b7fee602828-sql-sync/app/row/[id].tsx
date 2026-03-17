import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { addRow, updateRow, queryRows } from '../../lib/db';
import FieldInput from '../../components/FieldInput';
import VoiceInput from '../../components/VoiceInput';
import { parseVoiceCommand } from '../../lib/voice';

const RowScreen = () => {
  const { id, dbId } = useLocalSearchParams();
  const router = useRouter();
  const { databases } = useStore();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const database = databases.find(db => db.id === dbId);

  useEffect(() => {
    const fetchRow = async () => {
      try {
        if (id && id !== 'new') {
          const rows = await queryRows(dbId, `SELECT * FROM rows WHERE id = ${id}`);
          if (rows.length > 0) {
            setFormData(rows[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching row:', error);
        Alert.alert('Error', 'Failed to load row data');
      } finally {
        setLoading(false);
      }
    };
    fetchRow();
  }, [id, dbId]);

  const handleSave = async () => {
    try {
      if (id && id !== 'new') {
        await updateRow(dbId, id, formData);
      } else {
        await addRow(dbId, formData);
      }
      router.back();
    } catch (error) {
      console.error('Error saving row:', error);
      Alert.alert('Error', 'Failed to save row');
    }
  };

  const handleVoiceInput = (transcript) => {
    try {
      const command = parseVoiceCommand(transcript);
      if (command.action === 'add') {
        const newData = { ...formData };
        database.schema.forEach((field, index) => {
          if (command.fields[index]) {
            newData[field.name] = command.fields[index];
          }
        });
        setFormData(newData);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      Alert.alert('Error', 'Failed to process voice input');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{id === 'new' ? 'Add New Row' : 'Edit Row'}</Text>

      <VoiceInput onTranscription={handleVoiceInput} />

      {database?.schema.map((field, index) => (
        <FieldInput
          key={index}
          field={field}
          value={formData[field.name] || ''}
          onChange={(text) => setFormData({ ...formData, [field.name]: text })}
        />
      ))}

      <Button
        title="Save"
        onPress={handleSave}
        disabled={Object.keys(formData).length === 0}
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default RowScreen;
