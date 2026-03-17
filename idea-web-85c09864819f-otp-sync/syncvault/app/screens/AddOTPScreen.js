import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../App';

const AddOTPScreen = ({ navigation }) => {
  const [accountName, setAccountName] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleAddAccount = async () => {
    if (!accountName || !secretKey) {
      Alert.alert('Error', 'Please enter both account name and secret key');
      return;
    }

    // Validate secret key format (base32)
    const base32Regex = /^[A-Z2-7]+=*$/;
    if (!base32Regex.test(secretKey.toUpperCase())) {
      Alert.alert('Error', 'Invalid secret key format. Must be base32 encoded.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      await addDoc(collection(db, 'users', user.uid, 'otpAccounts'), {
        name: accountName,
        secret: secretKey.toUpperCase(),
        createdAt: new Date(),
      });

      Alert.alert('Success', 'OTP account added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.label}>Account Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Google, GitHub, AWS"
          value={accountName}
          onChangeText={setAccountName}
        />

        <Text style={styles.label}>Secret Key</Text>
        <TextInput
          style={styles.input}
          placeholder="Base32 encoded secret"
          value={secretKey}
          onChangeText={setSecretKey}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <Text style={styles.hint}>
          Enter the secret key from your 2FA setup. This is usually shown as a QR code or text during setup.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleAddAccount}>
          <Text style={styles.buttonText}>Add Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default AddOTPScreen;
