import React from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';

const FieldInput = ({ field, value, onChange }) => {
  const renderInput = () => {
    switch (field.type) {
      case 'BOOLEAN':
        return (
          <Switch
            value={value === 'true' || value === true}
            onValueChange={(val) => onChange(val.toString())}
          />
        );
      case 'INTEGER':
      case 'REAL':
        return (
          <TextInput
            style={styles.input}
            placeholder={field.name}
            value={value ? value.toString() : ''}
            onChangeText={onChange}
            keyboardType="numeric"
          />
        );
      case 'DATE':
        return (
          <TextInput
            style={styles.input}
            placeholder={field.name}
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            // In a real app, you'd use a proper date picker here
          />
        );
      default:
        return (
          <TextInput
            style={styles.input}
            placeholder={field.name}
            value={value}
            onChangeText={onChange}
            multiline={field.type === 'TEXT' && field.name.toLowerCase().includes('note')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{field.name}</Text>
      {renderInput()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
});

export default FieldInput;
