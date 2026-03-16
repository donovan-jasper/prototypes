import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store/useStore';
import { addRow, updateRow, queryRows } from '../../lib/db';

const RowScreen = () => {
  const { id, dbId } = useLocalSearchParams();
  const { databases } = useStore();
  const [formData, setFormData] = useState({});
  const database = databases.find(db => db.id === dbId);

  useEffect(() => {
    const fetchRow = async () => {
      if (id) {
        const rows = await queryRows(dbId, `SELECT * FROM rows WHERE id = ${id}`);
        setFormData(rows[0]);
      }
    };
    fetchRow();
  }, [id, dbId]);

  const handleSave = async () => {
    if (id) {
      await updateRow(dbId, id, formData);
    } else {
      await addRow(dbId, formData);
    }
  };

  return (
    <View style={styles.container}>
      {database?.schema.map((field, index) => (
        <View key={index} style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder={field.name}
            value={formData[field.name] || ''}
            onChangeText={(text) => setFormData({ ...formData, [field.name]: text })}
          />
        </View>
      ))}
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
  },
});

export default RowScreen;
