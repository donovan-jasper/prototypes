import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { detectStillness } from '@/lib/sensors/motionDetector';
import { sendTwilioSMS } from '@/lib/notifications/alertManager';

const EMERGENCY_TASK_NAME = 'emergency-alert-task';

interface EmergencyAlertProps {
  isPremium: boolean;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ isPremium }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [stillnessDuration, setStillnessDuration] = useState(0);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);

  const { emergencyContact, setEmergencyContact } = useAppStore();

  useEffect(() => {
    if (emergencyContact) {
      setPhoneNumber(emergencyContact);
      setIsEnabled(true);
    }

    // Register background task
    TaskManager.defineTask(EMERGENCY_TASK_NAME, async () => {
      try {
        const stillnessDetected = await detectStillness(120); // Check last 2 minutes
        if (stillnessDetected) {
          setStillnessDuration(prev => prev + 2); // Increment by 2 minutes

          if (stillnessDuration >= 10 && (!lastAlertTime || (new Date().getTime() - lastAlertTime.getTime()) > 3600000)) {
            // Send alert if stillness >10 minutes and not sent in last hour
            await sendTwilioSMS(emergencyContact, 'Emergency alert: No movement detected for 10+ minutes');
            setLastAlertTime(new Date());
            setStillnessDuration(0);

            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Emergency Alert Sent',
                body: 'Your emergency contact has been notified',
              },
              trigger: null,
            });
          }
        } else {
          setStillnessDuration(0);
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register background fetch
    BackgroundFetch.registerTaskAsync(EMERGENCY_TASK_NAME, {
      minimumInterval: 120, // 2 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    return () => {
      BackgroundFetch.unregisterTaskAsync(EMERGENCY_TASK_NAME);
    };
  }, [emergencyContact, stillnessDuration, lastAlertTime]);

  const handleSaveContact = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setEmergencyContact(phoneNumber);
    Alert.alert('Success', 'Emergency contact saved');
  };

  const toggleEmergencyAlert = () => {
    if (!isPremium) {
      Alert.alert('Premium Feature', 'Emergency alerts require a premium subscription');
      return;
    }

    setIsEnabled(!isEnabled);
    if (!isEnabled) {
      setStillnessDuration(0);
      setLastAlertTime(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Alert</Text>

      {!isPremium && (
        <View style={styles.premiumNotice}>
          <Text style={styles.premiumText}>Premium feature</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Emergency contact phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        editable={isPremium}
      />

      <Button
        title={emergencyContact ? 'Update Contact' : 'Save Contact'}
        onPress={handleSaveContact}
        disabled={!isPremium}
      />

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Enable Emergency Alert</Text>
        <Button
          title={isEnabled ? 'Disable' : 'Enable'}
          onPress={toggleEmergencyAlert}
          disabled={!isPremium}
        />
      </View>

      {isEnabled && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {stillnessDuration >= 10
              ? 'Alert sent!'
              : `Stillness detected: ${stillnessDuration} minutes`}
          </Text>
          {stillnessDuration > 0 && stillnessDuration < 10 && (
            <Text style={styles.countdownText}>
              Alert in: {10 - stillnessDuration} minutes
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  premiumNotice: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  premiumText: {
    color: '#0066cc',
    fontSize: 14,
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
  statusContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
  },
  countdownText: {
    fontSize: 14,
    color: '#666',
  },
});
