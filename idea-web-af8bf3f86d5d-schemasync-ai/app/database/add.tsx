import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, RadioButton, Text, ActivityIndicator, IconButton } from 'react-native-paper';
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
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const addDatabase = useDatabaseStore(state => state.addDatabase);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset connection status when form changes
    if (connectionStatus !== 'idle') {
      setConnectionStatus('idle');
    }
  };

  const handleTestConnection = async () => {
    if (!formData.host || !formData.port || !formData.username || !formData.password || !formData.databaseName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('idle');
    try {
      const connectionString = `${formData.type}://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.databaseName}`;
      const isConnected = await testConnection(connectionString, formData.type);

      if (isConnected) {
        setConnectionStatus('success');
        Alert.alert('Success', 'Connection successful!');
      } else {
        setConnectionStatus('error');
        Alert.alert('Error', 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
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

    if (connectionStatus !== 'success') {
      Alert.alert('Error', 'Please test the connection first and ensure it succeeds');
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
      setConnectionStatus('idle');
    } catch (error) {
      Alert.alert('Error', 'Failed to save database: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <IconButton icon="check-circle" iconColor="green" size={20} />;
      case 'error':
        return <IconButton icon="alert-circle" iconColor="red" size={20} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
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
          loading={isTesting}
          icon={isTesting ? undefined : 'wifi'}
          style={styles.testButton}
        >
          Test Connection
        </Button>

        {getStatusIcon()}

        <Button
          mode="contained"
          onPress={handleSaveDatabase}
          disabled={isTesting || isSaving || connectionStatus !== 'success'}
          loading={isSaving}
          icon={isSaving ? undefined : 'content-save'}
          style={styles.saveButton}
        >
          Save Database
        </Button>
      </View>

      {connectionStatus === 'success' && (
        <View style={styles.statusContainer}>
          <IconButton icon="check-circle" iconColor="green" size={20} />
          <Text style={styles.successText}>Connection successful!</Text>
        </View>
      )}

      {connectionStatus === 'error' && (
        <View style={styles.statusContainer}>
          <IconButton icon="alert-circle" iconColor="red" size={20} />
          <Text style={styles.errorText}>Connection failed. Please check your credentials.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  testButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
    borderRadius: 4,
    backgroundColor: connectionStatus === 'success' ? '#e8f5e9' : '#ffebee',
  },
  successText: {
    color: 'green',
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    marginLeft: 8,
  },
});

export default AddDatabaseScreen;
