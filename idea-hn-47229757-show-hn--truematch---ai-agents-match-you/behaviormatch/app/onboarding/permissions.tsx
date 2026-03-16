import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import PrivacyToggle from '../../components/PrivacyToggle';
import Colors from '../../constants/Colors';

export default function PermissionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Preferences</Text>
      <Text style={styles.subtitle}>
        We respect your privacy. Choose what data we collect to improve your matches.
      </Text>
      <PrivacyToggle
        title="Interaction Tracking"
        description="Track your app usage patterns"
        settingKey="interactionTracking"
      />
      <PrivacyToggle
        title="Message Analysis"
        description="Analyze your message content and patterns"
        settingKey="messageAnalysis"
      />
      <PrivacyToggle
        title="Behavioral Fingerprinting"
        description="Create a behavioral profile for matching"
        settingKey="behavioralFingerprinting"
      />
      <Link href="/(tabs)" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Finish Setup</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
