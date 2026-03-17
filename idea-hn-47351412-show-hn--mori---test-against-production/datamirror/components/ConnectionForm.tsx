import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { TextInput, Button, RadioButton, Text, HelperText } from 'react-native-paper';

export default function ConnectionForm({ visible, onDismiss, onSubmit }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('postgres');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name) newErrors.name = 'Connection name is required';
    if (!host) newErrors.host = 'Host is required';
    if (!port || isNaN(port)) newErrors.port = 'Valid port number is required';
    if (!database) newErrors.database = 'Database name is required';
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const connection = {
        id: Date.now().toString(),
        name,
        type,
        host,
        port: parseInt(port),
        database,
        username,
        password,
        encrypted_password: btoa(password) // Simple encryption for demo
      };
      onSubmit(connection);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setType('postgres');
    setHost('');
    setPort('');
    setDatabase('');
    setUsername('');
    setPassword('');
    setErrors({});
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss} animationType="slide">
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Add Database Connection</Text>

        <TextInput
          label="Connection Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!errors.name}
        />
        {errors.name && <HelperText type="error">{errors.name}</HelperText>}

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
          error={!!errors.host}
        />
        {errors.host && <HelperText type="error">{errors.host}</HelperText>}

        <TextInput
          label="Port"
          value={port}
          onChangeText={setPort}
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.port}
        />
        {errors.port && <HelperText type="error">{errors.port}</HelperText>}

        <TextInput
          label="Database"
          value={database}
          onChangeText={setDatabase}
          style={styles.input}
          error={!!errors.database}
        />
        {errors.database && <HelperText type="error">{errors.database}</HelperText>}

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          error={!!errors.username}
        />
        {errors.username && <HelperText type="error">{errors.username}</HelperText>}

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          error={!!errors.password}
        />
        {errors.password && <HelperText type="error">{errors.password}</HelperText>}

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Save Connection
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  radioGroup: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
