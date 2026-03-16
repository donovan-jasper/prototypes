import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, HelperText, RadioButton, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDatabaseStore } from '@/store/database-store';

const AddDatabaseScreen = () => {
  const navigation = useNavigation();
  const { addDatabase } = useDatabaseStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('postgresql');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const connectionString = `${type}://${username}:${password}@${host}:${port}/${databaseName}`;
      const newDatabase = {
        id: Date.now().toString(),
        name,
        type,
        connectionString,
        lastSync: new Date(),
      };
      await addDatabase(newDatabase);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Database Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Text style={styles.label}>Database Type</Text>
      <RadioButton.Group onValueChange={setType} value={type}>
        <View style={styles.radioGroup}>
          <RadioButton.Item label="PostgreSQL" value="postgresql" />
          <RadioButton.Item label="MySQL" value="mysql" />
          <RadioButton.Item label="Supabase" value="supabase" />
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
        keyboardType="numeric"
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
      <TextInput
        label="Database Name"
        value={databaseName}
        onChangeText={setDatabaseName}
        style={styles.input}
      />
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Add Database
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  radioGroup: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default AddDatabaseScreen;
