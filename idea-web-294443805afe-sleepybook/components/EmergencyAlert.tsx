import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import { detectStillness } from '@/lib/sensors/motionDetector';

const EMERGENCY_TASK_NAME = 'emergency-alert-task';

interface EmergencyAlertProps {
  isPremium: boolean;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ isPremium }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [stillnessDuration, setStillnessDuration] = useState(0);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const { emergencyContact, setEmergencyContact, setLastAlertTime: storeLastAlertTime } = useAppStore();

  useEffect(() => {
    if (emergencyContact) {
      setPhoneNumber(emergencyContact);
      setIsEnabled(true);
    }

    // Register background task
    TaskManager.defineTask(EMERGENCY_TASK_NAME, async () => {
      try {
        if (!isEnabled || !emergencyContact) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        const stillnessDetected = await detectStillness(600); // Check last 10 minutes
        if (stillnessDetected) {
          setStillnessDuration(prev => prev + 2); // Increment by 2 minutes

          if (stillnessDuration >= 10 && (!lastAlertTime || (new Date().getTime() - lastAlertTime.getTime()) > 3600000)) {
            // Send alert if stillness >10 minutes and not sent in last hour
            const { result } = await SMS.sendSMSAsync(
              [emergencyContact],
              'Emergency alert: No movement detected for 10+ minutes'
            );

            if (result === 'sent') {
              const alertTime = new Date();
              setLastAlertTime(alertTime);
              storeLastAlertTime(alertTime);
              setStillnessDuration(0);

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Emergency Alert Sent',
                  body: 'Your emergency contact has been notified',
                },
                trigger: null,
              });
            }
          }
        } else {
          setStillnessDuration(0);
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Error in emergency alert task:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    return () => {
      // Clean up background task
      TaskManager.unregisterTaskAsync(EMERGENCY_TASK_NAME);
    };
  }, [emergencyContact, stillnessDuration, lastAlertTime, isEnabled, storeLastAlertTime]);

  useEffect(() => {
    // Register/unregister background fetch based on isEnabled
    if (isEnabled && isPremium) {
      BackgroundFetch.registerTaskAsync(EMERGENCY_TASK_NAME, {
        minimumInterval: 120, // 2 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      }).then(() => {
        setIsMonitoring(true);
      }).catch(error => {
        console.error('Failed to register background fetch:', error);
        Alert.alert('Error', 'Failed to start emergency monitoring');
      });
    } else {
      BackgroundFetch.unregisterTaskAsync(EMERGENCY_TASK_NAME).then(() => {
        setIsMonitoring(false);
      });
    }

    return () => {
      BackgroundFetch.unregisterTaskAsync(EMERGENCY_TASK_NAME);
    };
  }, [isEnabled, isPremium]);

  const handleSaveContact = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneNumber)) {
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

    if (!isEnabled && !phoneNumber) {
      Alert.alert('Error', 'Please save an emergency contact first');
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
        <Switch
          value={isEnabled}
          onValueChange={toggleEmergencyAlert}
          disabled={!isPremium}
        />
      </View>

      {isEnabled && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isMonitoring ? 'Monitoring for stillness...' : 'Not monitoring'}
          </Text>
          {stillnessDuration > 0 && (
            <Text style={styles.durationText}>
              Stillness detected: {stillnessDuration} minutes
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  premiumText: {
    color: '#0066cc',
    fontSize: 14,
  },
  statusContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e6f7ff',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#0050b3',
  },
  durationText: {
    fontSize: 14,
    color: '#fa541c',
    marginTop: 4,
  },
});
