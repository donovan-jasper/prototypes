import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useUserStore } from '../../store/useUserStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { scheduleDailyDigestNotification } from '../../lib/notifications';

const ProfileScreen = () => {
  const { isPremium, setPremiumStatus } = useUserStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [digestTime, setDigestTime] = useState({ hour: 7, minute: 0 });
  const navigation = useNavigation();

  useEffect(() => {
    // Load user preferences from storage
    // This would be implemented with AsyncStorage in a real app
  }, []);

  const handleUpgrade = () => {
    // In a real app, this would trigger the in-app purchase flow
    Alert.alert(
      'Upgrade to Premium',
      'Unlock all features including audio summaries and unlimited searches.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Upgrade',
          onPress: () => {
            setPremiumStatus(true);
            Alert.alert('Success', 'You are now a premium user!');
          },
        },
      ]
    );
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    setDigestTime(prev => ({
      ...prev,
      [type]: value
    }));

    // Schedule the new notification time
    scheduleDailyDigestNotification(value === 'hour' ? value : prev.hour, value === 'minute' ? value : prev.minute);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Subscription Status</Text>
          <Text style={[styles.settingValue, isPremium ? styles.premiumText : styles.freeText]}>
            {isPremium ? 'Premium' : 'Free'}
          </Text>
        </View>

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.gray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Daily Digest Time</Text>
          <View style={styles.timePicker}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                const newHour = digestTime.hour === 0 ? 23 : digestTime.hour - 1;
                handleTimeChange('hour', newHour);
              }}
            >
              <Ionicons name="chevron-up" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.timeText}>
              {digestTime.hour.toString().padStart(2, '0')}:{digestTime.minute.toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                const newHour = digestTime.hour === 23 ? 0 : digestTime.hour + 1;
                handleTimeChange('hour', newHour);
              }}
            >
              <Ionicons name="chevron-down" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Language</Text>
          <Text style={styles.settingValue}>English</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  settingValue: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  premiumText: {
    color: Colors.success,
    fontWeight: 'bold',
  },
  freeText: {
    color: Colors.warning,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    padding: 8,
  },
  timeText: {
    fontSize: 16,
    color: Colors.text,
    marginHorizontal: 12,
    minWidth: 60,
    textAlign: 'center',
  },
});

export default ProfileScreen;
