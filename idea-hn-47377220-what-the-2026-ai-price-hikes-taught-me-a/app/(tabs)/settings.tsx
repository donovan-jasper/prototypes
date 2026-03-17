import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text, Button, TextInput, Switch, Divider, Card, Chip } from 'react-native-paper';
import { getSetting, setSetting, getAllApiKeys, saveApiKey } from '../../services/database';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const [budgetLimit, setBudgetLimit] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const limit = await getSetting('budget_limit');
      if (limit) setBudgetLimit(limit);

      const notifications = await getSetting('notifications_enabled');
      setNotificationsEnabled(notifications !== 'false');

      const keys = await getAllApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await setSetting('budget_limit', budgetLimit);
      await setSetting('notifications_enabled', notificationsEnabled ? 'true' : 'false');
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleEditApiKey = (provider: string) => {
    setEditingKey(provider);
    setNewApiKey(apiKeys[provider] || '');
  };

  const handleSaveApiKey = async () => {
    if (!editingKey) return;

    try {
      await saveApiKey(editingKey, newApiKey);
      setApiKeys({ ...apiKeys, [editingKey]: newApiKey });
      setEditingKey(null);
      setNewApiKey('');
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handleUpgrade = () => {
    navigation.navigate('pro-upgrade');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Settings
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Configure your preferences and API connections
        </Text>
      </View>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Budget Settings
          </Text>
          <View style={styles.settingRow}>
            <Text variant="bodyMedium">Monthly Budget Limit ($)</Text>
            <TextInput
              value={budgetLimit}
              onChangeText={setBudgetLimit}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              dense
            />
          </View>
          <View style={styles.settingRow}>
            <Text variant="bodyMedium">Budget Alerts</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            API Connections
          </Text>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Connect your AI service accounts to automatically track usage
          </Text>

          {Object.entries(apiKeys).map(([provider, key]) => (
            <View key={provider} style={styles.apiKeyRow}>
              <View style={styles.apiKeyInfo}>
                <Text variant="bodyMedium">{provider}</Text>
                <Text variant="bodySmall" style={styles.apiKeyValue}>
                  {key ? '••••••' + key.slice(-4) : 'Not connected'}
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => handleEditApiKey(provider)}
                style={styles.editButton}
              >
                {key ? 'Edit' : 'Connect'}
              </Button>
            </View>
          ))}

          {editingKey && (
            <View style={styles.apiKeyEditor}>
              <TextInput
                label={`Enter ${editingKey} API Key`}
                value={newApiKey}
                onChangeText={setNewApiKey}
                secureTextEntry
                style={styles.apiKeyInput}
                mode="outlined"
              />
              <View style={styles.editorButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setEditingKey(null)}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveApiKey}
                >
                  Save
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Pro Features
          </Text>
          <Text variant="bodyMedium" style={styles.proText}>
            Upgrade to ModelMiser Pro for advanced cost tracking, API integration, and more.
          </Text>
          <Button
            mode="contained"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          >
            Upgrade to Pro
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={saveSettings}
        style={styles.saveButton}
      >
        Save Settings
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    width: 100,
    height: 40,
  },
  apiKeyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  apiKeyInfo: {
    flex: 1,
  },
  apiKeyValue: {
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    width: 80,
  },
  apiKeyEditor: {
    marginTop: 16,
  },
  apiKeyInput: {
    marginBottom: 16,
  },
  editorButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  proText: {
    marginBottom: 16,
  },
  upgradeButton: {
    marginTop: 8,
  },
  saveButton: {
    marginVertical: 16,
  },
});
