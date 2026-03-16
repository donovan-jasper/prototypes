import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, RadioButton, Text } from 'react-native-paper';

export default function ConnectionForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState('postgres');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    console.log('Connection submitted:', { name, type, host, port, database, username, password });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Connection Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <RadioButton.Group onValueChange={setType} value={type}>
        <View style={styles.radioGroup}>
          <RadioButton.Item label="PostgreSQL" value="postgres" />
          <RadioButton.Item label="MySQL" value="mysql" />
          <RadioButton.Item label="SQLite" value="sqlite" />
        </View>
      </RadioButton.Group>
      <TextInput
        label="Host"
        value={host}
        onChangeText={setHost}
        style={styles.input}
      />
      <TextInput
        label="Port"
        value={port}
        onChangeText={setPort}
        style={styles.input}
      />
      <TextInput
        label="Database"
        value={database}
        onChangeText={setDatabase}
        style={styles.input}
      />
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Save Connection
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  radioGroup: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
