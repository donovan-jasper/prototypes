import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';

const EmergencyAlert = () => {
  const [contact, setContact] = useState('');

  const saveContact = () => {
    // Save contact to database or state
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
      />
      <Button title="Save Contact" onPress={saveContact} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default EmergencyAlert;
