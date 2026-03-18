import React from 'react';
import { View, StyleSheet, Switch, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import useAppStore from '../../store/useAppStore';
import ThemePicker from '../../components/ThemePicker';

const SettingsScreen = () => {
  const { notificationsEnabled, toggleNotifications } = useAppStore();

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your focus modes, widgets, and settings will be exported to a file.',
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset App Data',
      'This will delete all your focus modes, widgets, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          Alert.alert('Data Reset', 'All app data has been reset.');
        }}
      ]
    );
  };

  const handleSubscribe = () => {
    Alert.alert(
      'Premium Features',
      'Unlock unlimited focus modes, 20+ premium themes, advanced widgets, and cloud sync for $3.99/month or $29.99/year.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <ThemePicker />

      <Text style={styles.sectionTitle}>Premium Features</Text>
      <View style={styles.premiumSection}>
        <Text style={styles.premiumText}>
          Unlock unlimited focus modes, 20+ themes, advanced widgets, and cloud sync
        </Text>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.setting}>
        <Text style={styles.settingLabel}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <Text style={styles.sectionTitle}>Data Management</Text>
      <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
        <Text style={styles.actionButtonText}>Export Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleResetData}>
        <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Reset App Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  premiumSection: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  premiumText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
  },
  dangerButtonText: {
    color: '#d32f2f',
  },
});

export default SettingsScreen;
