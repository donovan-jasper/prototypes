import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import { insertUser } from '@/lib/database';
import { User } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');

    if (!name || !email || !password || !age) {
      setError('Please fill in all fields');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setError('You must be 18 or older to use BridgeCircle');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser: User = {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        age: ageNum,
        interests: [],
        isPremium: false,
        createdAt: Date.now(),
        ageGapPreference: 25,
      };

      await insertUser(newUser);
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('authToken', `token_${userId}`);

      router.replace('/(tabs)');
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>Join BridgeCircle</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Connect with mentors and friends across generations
          </Text>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoComplete="name"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            autoComplete="password"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Age"
            value={age}
            onChangeText={setAge}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            disabled={loading}
          />

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={acceptedTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}
            />
            <Text variant="bodyMedium" style={styles.checkboxLabel}>
              I accept the Terms of Service and Privacy Policy
            </Text>
          </View>

          {error ? (
            <HelperText type="error" visible={true} style={styles.error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Create Account
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            disabled={loading}
            style={styles.linkButton}
          >
            Already have an account? Sign in
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 16,
  },
  error: {
    marginBottom: 8,
  },
});
