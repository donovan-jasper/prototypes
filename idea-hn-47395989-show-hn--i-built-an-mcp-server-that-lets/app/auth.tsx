import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThreadsClient } from '../lib/threads';
import { BlueskyClient } from '../lib/bluesky';
import { useStore } from '../store/useStore';

export default function AuthScreen() {
  const [threadsClient] = useState(new ThreadsClient());
  const [blueskyClient] = useState(new BlueskyClient());
  const [blueskyHandle, setBlueskyHandle] = useState('');
  const [blueskyPassword, setBlueskyPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addAccount = useStore(state => state.addAccount);

  const handleThreadsLogin = async () => {
    setIsLoading(true);
    try {
      const user = await threadsClient.authenticate();
      addAccount({
        id: user.id,
        platform: 'threads',
        username: user.username,
        accessToken: '', // Token is stored securely in the client
      });
      Alert.alert('Success', `Connected to Threads as @${user.username}`);
    } catch (error) {
      console.error('Threads login error:', error);
      Alert.alert('Error', 'Failed to connect to Threads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlueskyLogin = async () => {
    if (!blueskyHandle || !blueskyPassword) {
      Alert.alert('Error', 'Please enter both handle and password');
      return;
    }

    setIsLoading(true);
    try {
      const session = await blueskyClient.authenticate(blueskyHandle, blueskyPassword);
      addAccount({
        id: session.did,
        platform: 'bluesky',
        username: blueskyHandle,
        accessToken: '', // Session is stored securely in the client
      });
      Alert.alert('Success', `Connected to Bluesky as ${blueskyHandle}`);
    } catch (error) {
      console.error('Bluesky login error:', error);
      Alert.alert('Error', 'Failed to connect to Bluesky');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Accounts</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threads</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleThreadsLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Connect Threads</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bluesky</Text>
        <TextInput
          style={styles.input}
          placeholder="Handle (e.g., user.bsky.social)"
          value={blueskyHandle}
          onChangeText={setBlueskyHandle}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={blueskyPassword}
          onChangeText={setBlueskyPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleBlueskyLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Connect Bluesky</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <Text style={styles.loading}>Connecting...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
