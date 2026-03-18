import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useMemoryStore } from '../../store/memoryStore';
import { getApiKey, setApiKey } from '../../lib/ai';

const SettingsScreen = () => {
  const { notificationEnabled, toggleNotification, locationEnabled, toggleLocation } = useMemoryStore();
  const [apiKey, setApiKeyState] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const key = await getApiKey();
    if (key) {
      setApiKeyState(key);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    try {
      await setApiKey(apiKey.trim());
      Alert.alert('Success', 'OpenAI API key saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
      <View style={styles.apiKeySection}>
        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKeyState}
          placeholder="sk-..."
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveApiKey}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save API Key'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>
          Get your API key from platform.openai.com/api-keys
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Permissions</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Notifications</Text>
        <Switch
          value={notificationEnabled}
          onValueChange={toggleNotification}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Location Services</Text>
        <Switch
          value={locationEnabled}
          onValueChange={toggleLocation}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  apiKeySection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsScreen;
