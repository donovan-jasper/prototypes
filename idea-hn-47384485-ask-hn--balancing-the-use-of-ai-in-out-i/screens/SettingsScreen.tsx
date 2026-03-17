import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [premiumEnabled, setPremiumEnabled] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);
  const toggleDarkMode = () => setDarkModeEnabled(previousState => !previousState);

  const togglePremium = () => {
    if (!premiumEnabled) {
      Alert.alert(
        "Upgrade to Premium",
        "You're about to upgrade to the premium version for $6.99/month. This will enable all premium features including real-time message analysis in browser extensions.",
        [
          { text: "Cancel" },
          { text: "Upgrade", onPress: () => setPremiumEnabled(true) }
        ]
      );
    } else {
      setPremiumEnabled(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Enable Notifications</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleNotifications}
          value={notificationsEnabled}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={darkModeEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleDarkMode}
          value={darkModeEnabled}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Premium Subscription</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={premiumEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={togglePremium}
          value={premiumEnabled}
        />
      </View>
      {premiumEnabled && (
        <View style={styles.premiumInfo}>
          <Text style={styles.premiumTitle}>Premium Features:</Text>
          <Text style={styles.premiumFeature}>- Unlimited analyses</Text>
          <Text style={styles.premiumFeature}>- Advanced detection (identifies specific AI models)</Text>
          <Text style={styles.premiumFeature}>- Unlimited conversation history with search</Text>
          <Text style={styles.premiumFeature}>- Multi-platform relationship tracking</Text>
          <Text style={styles.premiumFeature}>- Response coaching with personalized strategies</Text>
          <Text style={styles.premiumFeature}>- Authenticity trend alerts</Text>
          <Text style={styles.premiumFeature}>- Export detailed reports (PDF/CSV)</Text>
          <Text style={styles.premiumFeature}>- Priority cloud processing (faster results)</Text>
          <Text style={styles.premiumFeature}>- Browser extension for desktop messaging (NEW!)</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingLabel: {
    fontSize: 16,
  },
  premiumInfo: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 5,
    marginVertical: 20,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  premiumFeature: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;
