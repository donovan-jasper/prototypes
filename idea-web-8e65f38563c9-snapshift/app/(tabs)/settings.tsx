import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import PromptScheduler from '../../components/PromptScheduler';

export default function SettingsScreen() {
  const { isPremium, upgradeToPremium } = useContext(SubscriptionContext);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        {isPremium ? (
          <Text style={styles.subscriptionStatus}>Premium Member</Text>
        ) : (
          <TouchableOpacity style={styles.upgradeButton} onPress={upgradeToPremium}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prompt Schedule</Text>
        <PromptScheduler />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subscriptionStatus: {
    fontSize: 16,
    color: '#673ab7',
  },
  upgradeButton: {
    backgroundColor: '#673ab7',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
