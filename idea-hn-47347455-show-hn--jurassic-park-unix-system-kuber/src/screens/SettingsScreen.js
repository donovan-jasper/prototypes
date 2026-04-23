import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { kubernetesAPI } from '../services/KubernetesAPI';
import { WEBSOCKET_ENDPOINT } from '../utils/constants';

const SettingsScreen = () => {
  const [apiEndpoint, setApiEndpoint] = useState(process.env.KUBERNETES_API_URL || 'https://your-kubernetes-api-endpoint');
  const [wsEndpoint, setWsEndpoint] = useState(process.env.KUBERNETES_WS_ENDPOINT || WEBSOCKET_ENDPOINT);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveConfig = () => {
    if (!apiEndpoint || !wsEndpoint) {
      Alert.alert('Error', 'Please enter both API and WebSocket endpoints');
      return;
    }

    // Validate URLs
    try {
      new URL(apiEndpoint);
      new URL(wsEndpoint);
    } catch (e) {
      Alert.alert('Error', 'Please enter valid URLs');
      return;
    }

    // Update the API endpoints
    kubernetesAPI.baseURL = apiEndpoint;
    kubernetesAPI.wsEndpoint = wsEndpoint;

    Alert.alert('Success', 'Configuration saved successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.configContainer}>
        <Text style={styles.configTitle}>API Configuration</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kubernetes API Endpoint</Text>
          <TextInput
            style={styles.input}
            value={apiEndpoint}
            onChangeText={setApiEndpoint}
            placeholder="https://your-kubernetes-api.example.com"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>WebSocket Endpoint</Text>
          <TextInput
            style={styles.input}
            value={wsEndpoint}
            onChangeText={setWsEndpoint}
            placeholder="wss://your-websocket.example.com"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Auto Reconnect</Text>
          <Switch
            value={autoReconnect}
            onValueChange={setAutoReconnect}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveConfig}
        >
          <Text style={styles.buttonText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  configContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
