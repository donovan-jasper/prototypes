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

      router.replace('/(auth)/select-interests');
    } catch (err) {
      setError('Signup failed. Please try again.');
