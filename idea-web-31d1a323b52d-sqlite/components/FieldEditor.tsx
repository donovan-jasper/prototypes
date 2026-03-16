import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

interface FieldEditorProps {
  onSave: (field: { name: string; type: string }) => void;
}

export default function FieldEditor({ onSave }: FieldEditorProps) {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');

  const handleSave = () => {
    onSave({ name: fieldName, type: fieldType });
    setFieldName('');
    setFieldType('TEXT');
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Field Name"
        value={fieldName}
        onChangeText={setFieldName}
        style={styles.input}
      />
      <TextInput
        label="Field Type"
        value={fieldType}
        onChangeText={setFieldType}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Add Field
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
