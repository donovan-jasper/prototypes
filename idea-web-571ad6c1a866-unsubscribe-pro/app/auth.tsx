import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, Text, RadioButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/user-store';
import { EmailClient } from '../lib/email-client';
import { initializeDatabase } from '../lib/database';

const AuthScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { setUser, setAuthToken } = useUserStore();
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook' | 'other'>('gmail');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize database when component mounts
    initializeDatabase().catch(error => {
      console.error('Database initialization failed:', error);
      Alert.alert('Error', 'Failed to initialize database');
    });
  }, []);

  const handleAuth = async () => {
    setIsLoading(true);

    try {
      // In a real app, you would use the appropriate client ID for each provider
      const clientId = selectedProvider === 'gmail'
        ? 'YOUR_GMAIL_CLIENT_ID'
        : selectedProvider === 'outlook'
          ? 'YOUR_OUTLOOK_CLIENT_ID'
          : '';

      const emailClient = new EmailClient(selectedProvider, clientId);

      if (selectedProvider === 'other') {
        // For other providers, we'll skip OAuth and proceed to IMAP setup
        setUser({
          email: 'user@example.com', // This would be set after IMAP setup
          provider: selectedProvider,
          isPremium: false,
        });
        setAuthToken(''); // No token for IMAP
        router.replace('/onboarding');
        return;
      }

      const success = await emailClient.authenticate();

      if (success) {
        // In a real app, you would store the token securely
        setUser({
          email: 'user@example.com', // This would be fetched from the provider
          provider: selectedProvider,
          isPremium: false,
        });
        setAuthToken('fake-token'); // In a real app, this would be the actual token
        router.replace('/onboarding');
      } else {
        Alert.alert('Error', 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Connect Your Email
      </Text>

      <Text variant="bodyMedium" style={styles.subtitle}>
        Choose your email provider to get started
      </Text>

      <RadioButton.Group
        onValueChange={value => setSelectedProvider(value as any)}
        value={selectedProvider}
      >
        <View style={styles.radioOption}>
          <RadioButton value="gmail" />
          <Text>Gmail</Text>
        </View>

        <View style={styles.radioOption}>
          <RadioButton value="outlook" />
          <Text>Outlook</Text>
        </View>

        <View style={styles.radioOption}>
          <RadioButton value="other" />
          <Text>Other (IMAP)</Text>
        </View>
      </RadioButton.Group>

      <Button
        mode="contained"
        onPress={handleAuth}
        disabled={isLoading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Connect Account</Text>
        )}
      </Button>

      <Text variant="bodySmall" style={styles.privacyText}>
        By connecting, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    color: 'gray',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  buttonContent: {
    height: 40,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyText: {
    marginTop: 30,
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
  },
});

export default AuthScreen;
