import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import * as SMS from 'expo-sms';
import * as Accelerometer from 'expo-sensors';
import { useIsFocused } from '@react-navigation/native';

const EmergencyAlert = () => {
  const [contact, setContact] = useState('');
  const [isStill, setIsStill] = useState(false);
  const [stillDuration, setStillDuration] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const isFocused = useIsFocused();

  const saveContact = () => {
    // Save contact to database or state
    Alert.alert('Success', 'Emergency contact saved!');
  };

  const checkStillness = (data) => {
    const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
    return magnitude < 0.1; // Threshold for stillness
  };

  useEffect(() => {
    if (!isFocused) return;

    let stillTimer = null;

    const _subscribe = () => {
      setSubscription(
        Accelerometer.addListener((data) => {
          const currentlyStill = checkStillness(data);

          if (currentlyStill) {
            setStillDuration(prev => prev + 1);
          } else {
            setStillDuration(0);
          }

          setIsStill(currentlyStill);
        })
      );

      Accelerometer.setUpdateInterval(1000); // Check every second
    };

    _subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (stillTimer) {
        clearInterval(stillTimer);
      }
    };
  }, [isFocused]);

  useEffect(() => {
    if (stillDuration >= 600) { // 10 minutes (600 seconds)
      sendEmergencyAlert();
      setStillDuration(0);
    }
  }, [stillDuration]);

  const sendEmergencyAlert = async () => {
    if (!contact) {
      Alert.alert('Error', 'No emergency contact set');
      return;
    }

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync(
          [contact],
          'Emergency alert: No movement detected for 10 minutes. Please check on the user.'
        );

        if (result === 'sent') {
          Alert.alert('Alert Sent', 'Emergency contact has been notified');
        } else {
          Alert.alert('Error', 'Failed to send SMS');
        }
      } else {
        Alert.alert('Error', 'SMS is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
      />
      <Button title="Save Contact" onPress={saveContact} />
      {isStill && (
        <Text style={styles.stillnessText}>
          Still for {Math.floor(stillDuration / 60)} minutes
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  stillnessText: {
    marginTop: 10,
    color: 'red',
    fontWeight: 'bold',
  },
});

export default EmergencyAlert;
