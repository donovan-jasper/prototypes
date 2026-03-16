import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { usePlatformStore } from '../../lib/store/usePlatformStore';

export default function SettingsScreen() {
  const { user, isPremium, upgradeToPremium } = useAuthStore();
  const { platforms, disconnectPlatform } = usePlatformStore();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Platforms</Text>
        {platforms.map((platform) => (
          <View key={platform.id} style={styles.platformItem}>
            <Text style={styles.platformName}>{platform.name}</Text>
            <TouchableOpacity onPress={() => disconnectPlatform(platform.id)}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Text style={styles.subscriptionStatus}>
          {isPremium ? 'Premium' : 'Free Tier'}
        </Text>
        {!isPremium && (
          <Button
            mode="contained"
            onPress={upgradeToPremium}
            style={styles.upgradeButton}
          >
            Upgrade to Premium
          </Button>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <Button mode="outlined" onPress={() => {}}>
          Export to CSV
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  platformName: {
    fontSize: 16,
  },
  disconnectText: {
    color: 'red',
    fontSize: 16,
  },
  subscriptionStatus: {
    fontSize: 16,
    marginBottom: 8,
  },
  upgradeButton: {
    marginTop: 8,
  },
});
