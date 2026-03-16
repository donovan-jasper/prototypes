import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import SubscriptionModal from '../../components/SubscriptionModal';
import { useUserStore } from '../../store/useUserStore';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { isPremium, togglePremium } = useUserStore();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthIntegrationEnabled, setHealthIntegrationEnabled] = useState(true);

  const handleSubscriptionPress = () => {
    if (isPremium) {
      // Handle manage subscription
    } else {
      setShowSubscriptionModal(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleSubscriptionPress}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Subscription</Text>
            <Text style={styles.settingValue}>
              {isPremium ? 'DriftWave Premium' : 'Free'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Health Integration</Text>
          </View>
          <Switch
            value={healthIntegrationEnabled}
            onValueChange={setHealthIntegrationEnabled}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor={healthIntegrationEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </TouchableOpacity>
      </View>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={togglePremium}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
});
