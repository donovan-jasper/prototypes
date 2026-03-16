import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import PrivacyToggle from '../../components/PrivacyToggle';
import Colors from '../../constants/Colors';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
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
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {/* Add account management components here */}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        {/* Add subscription management components here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
});
