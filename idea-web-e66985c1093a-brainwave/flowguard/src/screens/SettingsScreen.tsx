import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { AlertControls } from '../components/AlertControls';
import { AppContext } from '../context/AppContext';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useContext(AppContext);
  const [hapticEnabled, setHapticEnabled] = useState(settings.hapticEnabled);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  const handleHapticToggle = (value: boolean) => {
    setHapticEnabled(value);
    updateSettings({ ...settings, hapticEnabled: value });
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    updateSettings({ ...settings, soundEnabled: value });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Preferences</Text>
        <AlertControls
          hapticEnabled={hapticEnabled}
          soundEnabled={soundEnabled}
          onHapticToggle={handleHapticToggle}
          onSoundToggle={handleSoundToggle}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>Motion Activity</Text>
          <Switch value={true} disabled />
        </View>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>Microphone (optional)</Text>
          <Switch value={false} disabled />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Text style={styles.subscriptionStatus}>Free Tier</Text>
        <Text style={styles.subscriptionText}>
          Upgrade to unlock advanced features and remove ads.
        </Text>
        {/* Add upgrade button here */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  permissionText: {
    fontSize: 16,
  },
  subscriptionStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subscriptionText: {
    fontSize: 14,
    color: '#666',
  },
});
