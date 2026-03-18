import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, Switch, Divider } from 'react-native-paper';
import { getSettings, updateSettings } from '../../lib/db/queries';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await getSettings();
      setApiKey(settings.apiKey || '');
      setIsPremium(settings.isPremium);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      Alert.alert(
        'Invalid API Key',
        'Anthropic API keys should start with "sk-ant-". Please check your key and try again.'
      );
      return;
    }

    setSaving(true);
    try {
      await updateSettings({ apiKey: apiKey.trim() });
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleClearApiKey = async () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateSettings({ apiKey: '' });
              setApiKey('');
              Alert.alert('Success', 'API key cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear API key');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Settings
        </Text>
      </Surface>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Anthropic API Key
        </Text>
        <Text variant="bodyMedium" style={styles.sectionDescription}>
          Enter your own Anthropic API key to generate slides. Get your key from console.anthropic.com
        </Text>

        <TextInput
          mode="outlined"
          label="API Key"
          placeholder="sk-ant-..."
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          style={styles.input}
          disabled={loading || saving}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={handleSaveApiKey}
            loading={saving}
            disabled={loading || saving || !apiKey.trim()}
            style={styles.button}
          >
            Save API Key
          </Button>
          {apiKey && (
            <Button
              mode="outlined"
              onPress={handleClearApiKey}
              disabled={loading || saving}
              style={styles.button}
            >
              Clear
            </Button>
          )}
        </View>

        <Surface style={styles.infoBox} elevation={0}>
          <Text variant="bodySmall" style={styles.infoText}>
            💡 Your API key is stored locally on your device and never shared. You'll be charged directly by Anthropic based on your usage.
          </Text>
        </Surface>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Subscription
        </Text>
        <View style={styles.premiumRow}>
          <View style={styles.premiumInfo}>
            <Text variant="bodyLarge" style={styles.premiumLabel}>
              Premium Status
            </Text>
            <Text variant="bodySmall" style={styles.premiumDescription}>
              {isPremium ? 'Active' : 'Free tier'}
            </Text>
          </View>
          <Switch value={isPremium} disabled />
        </View>
        <Text variant="bodySmall" style={styles.comingSoonText}>
          Premium features coming soon
        </Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          About
        </Text>
        <Text variant="bodyMedium" style={styles.aboutText}>
          SlideFlow v1.0.0
        </Text>
        <Text variant="bodySmall" style={styles.aboutText}>
          Turn any idea into beautiful slides in seconds using AI
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    color: '#1565c0',
    lineHeight: 18,
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  premiumDescription: {
    color: '#666',
  },
  comingSoonText: {
    color: '#999',
    fontStyle: 'italic',
  },
  aboutText: {
    color: '#666',
    marginBottom: 8,
  },
});
