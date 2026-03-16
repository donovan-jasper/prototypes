import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const FieldInput = ({ field, value, onChange }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={field.name}
        value={value}
        onChangeText={onChange}
        keyboardType={field.type === 'INTEGER' || field.type === 'REAL' ? 'numeric' : 'default'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
  },
});

export default FieldInput;
