import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { getUserPreferences, updatePreferences } from '@/lib/database/queries';
import { initDatabase } from '@/lib/database/schema';

const DURATION_OPTIONS = [10, 15, 20, 25];

export default function SettingsScreen() {
  const [defaultDuration, setDefaultDuration] = useState(15);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      await initDatabase();
      const prefs = await getUserPreferences();
      if (prefs) {
        setDefaultDuration(prefs.default_duration);
        setHapticsEnabled(prefs.haptic_enabled === 1);
        setNotificationsEnabled(prefs.notifications_enabled === 1);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = async (duration: number) => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDefaultDuration(duration);
    await updatePreferences({
      default_duration: duration,
      haptic_enabled: hapticsEnabled ? 1 : 0,
      notifications_enabled: notificationsEnabled ? 1 : 0,
    });
  };

  const handleHapticsToggle = async (value: boolean) => {
    if (value) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setHapticsEnabled(value);
    await updatePreferences({
      default_duration: defaultDuration,
      haptic_enabled: value ? 1 : 0,
      notifications_enabled: notificationsEnabled ? 1 : 0,
    });
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNotificationsEnabled(value);
    await updatePreferences({
      default_duration: defaultDuration,
      haptic_enabled: hapticsEnabled ? 1 : 0,
      notifications_enabled: value ? 1 : 0,
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@restpulse.app?subject=RestPulse Support');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Preferences</Text>
        
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Default Session Duration</Text>
          <View style={styles.durationOptions}>
            {DURATION_OPTIONS.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationOption,
                  defaultDuration === duration && styles.durationOptionActive,
                ]}
                onPress={() => handleDurationChange(duration)}
              >
                <Text
                  style={[
                    styles.durationOptionText,
                    defaultDuration === duration && styles.durationOptionTextActive,
                  ]}
                >
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibration cues during sessions
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={hapticsEnabled ? '#667eea' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Session completion alerts
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={notificationsEnabled ? '#667eea' : '#f3f4f6'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium</Text>
        
        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <Text style={styles.premiumBadge}>Free Tier</Text>
          </View>
          <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
          <Text style={styles.premiumDescription}>
            Unlock all features and get the most out of your rest sessions
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>All session lengths (10/15/20/25 min)</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Full soundscape library (20+ environments)</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Advanced haptic patterns</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Unlimited analytics history</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Smart home integration</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => Alert.alert('Coming Soon', 'Premium features will be available soon!')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.settingCard} onPress={handleEmailSupport}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Support</Text>
            <Text style={styles.aboutLink}>support@restpulse.app</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  durationOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  durationOptionActive: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  durationOptionTextActive: {
    color: '#667eea',
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  premiumHeader: {
    marginBottom: 12,
  },
  premiumBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 16,
    color: '#667eea',
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  aboutValue: {
    fontSize: 16,
    color: '#6b7280',
  },
  aboutLink: {
    fontSize: 16,
    color: '#667eea',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 100,
  },
});
