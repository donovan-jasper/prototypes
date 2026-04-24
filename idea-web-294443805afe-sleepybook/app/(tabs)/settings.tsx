import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import { EmergencyAlert } from '@/components/EmergencyAlert';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsScreen() {
  const { isPremium, setPremiumStatus } = useAppStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEmergencyEnabled, setIsEmergencyEnabled] = useState(false);

  const handleSaveContact = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    // In a real app, you would save this to your backend or local storage
    Alert.alert('Success', 'Emergency contact saved');
  };

  const toggleEmergencyAlert = () => {
    if (!isPremium) {
      Alert.alert('Premium Feature', 'Emergency alerts require a premium subscription');
      return;
    }
    setIsEmergencyEnabled(!isEmergencyEnabled);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Alert</Text>

        <TextInput
          style={styles.input}
          placeholder="Emergency contact phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Button
          title="Save Contact"
          onPress={handleSaveContact}
        />

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Enable Emergency Alert</Text>
          <Switch
            value={isEmergencyEnabled}
            onValueChange={toggleEmergencyAlert}
            disabled={!isPremium}
          />
        </View>

        {!isPremium && (
          <View style={styles.premiumNotice}>
            <Text style={styles.premiumText}>Premium feature</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Button
          title={isPremium ? "Manage Subscription" : "Upgrade to Premium"}
          onPress={() => Alert.alert('Premium', 'Subscription management would go here')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
  },
  premiumNotice: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  premiumText: {
    color: '#0066cc',
    fontSize: 14,
  },
});
