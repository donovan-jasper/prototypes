import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BehaviorMatch</Text>
      <Text style={styles.subtitle}>
        Stop guessing who you'll click with — let AI match you based on how you actually act, not what you claim to be.
      </Text>
      <View style={styles.privacyContainer}>
        <Text style={styles.privacyText}>
          We value your privacy. Your data is used only to improve your matches and is never shared without your consent.
        </Text>
      </View>
      <Link href="/onboarding/preferences" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  privacyContainer: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
