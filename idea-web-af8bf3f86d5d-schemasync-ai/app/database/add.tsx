import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, RadioButton, Text, ActivityIndicator } from 'react-native-paper';
import { useDatabaseStore } from '../../store/database-store';
import { encryptCredentials } from '../../lib/utils/encryption';
import { testConnection } from '../../lib/database/connectors';
import { Database } from '../../types/database';

const AddDatabaseScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: '',
    username: '',
    password: '',
    databaseName: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const addDatabase = useDatabaseStore(state => state.addDatabase);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    if (!formData.host || !formData.port || !formData.username || !formData.password || !formData.databaseName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsTesting(true);
    try {
      const connectionString = `${formData.type}://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.databaseName}`;
      const isConnected = await testConnection(connectionString, formData.type);

      if (isConnected) {
        Alert.alert('Success', 'Connection successful!');
      } else {
        Alert.alert('Error', 'Connection failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveDatabase = async () => {
    if (!formData.name || !formData.host || !formData.port || !formData.username || !formData.password || !formData.databaseName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const connectionString = `${formData.type}://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.databaseName}`;
      const encryptedCredentials = encryptCredentials(connectionString);

      const newDatabase: Database = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        host: formData.host,
        port: formData.port,
        username: formData.username,
        encryptedCredentials,
        databaseName: formData.databaseName,
        lastSync: new Date(),
        schema: null
      };

      addDatabase(newDatabase);
      Alert.alert('Success', 'Database added successfully!');
      // Reset form
      setFormData({
        name: '',
        type: 'postgresql',
        host: '',
        port: '',
        username: '',
        password: '',
        databaseName: ''
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save database: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Add New Database</Text>

      <TextInput
        label="Connection Name"
        value={formData.name}
        onChangeText={(text) => handleInputChange('name', text)}
        style={styles.input}
        mode="outlined"
      />

      <View style={styles.radioContainer}>
        <Text>Database Type:</Text>
        <RadioButton.Group
          onValueChange={(value) => handleInputChange('type', value)}
          value={formData.type}
        >
          <View style={styles.radioOption}>
            <RadioButton value="postgresql" />
            <Text>PostgreSQL</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="mysql" />
            <Text>MySQL</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="supabase" />
            <Text>Supabase</Text>
          </View>
        </RadioButton.Group>
      </View>

      <TextInput
        label="Host"
        value={formData.host}
        onChangeText={(text) => handleInputChange('host', text)}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Port"
        value={formData.port}
        onChangeText={(text) => handleInputChange('port', text)}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />

      <TextInput
        label="Username"
        value={formData.username}
        onChangeText={(text) => handleInputChange('username', text)}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(text) => handleInputChange('password', text)}
        style={styles.input}
        mode="outlined"
        secureTextEntry
      />

      <TextInput
        label="Database Name"
        value={formData.databaseName}
        onChangeText={(text) => handleInputChange('databaseName', text)}
        style={styles.input}
        mode="outlined"
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleTestConnection}
          disabled={isTesting || isSaving}
          style={styles.button}
        >
          {isTesting ? <ActivityIndicator /> : 'Test Connection'}
        </Button>

        <Button
          mode="contained"
          onPress={handleSaveDatabase}
          disabled={isTesting || isSaving}
          style={styles.button}
        >
          {isSaving ? <ActivityIndicator /> : 'Save Database'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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

export default AddDatabaseScreen;
