import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import VerificationButton from '@/components/VerificationButton';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import { authenticateUser, isBiometricAvailable } from '@/lib/biometrics';
import { collectBehavioralData, calculateMovementEntropy } from '@/lib/sensors';
import { generateVerificationToken } from '@/lib/crypto';
import { calculateTrustScore } from '@/lib/trustScore';
import { initDatabase, saveVerification, getVerificationCount } from '@/lib/database';

export default function HomeScreen() {
  const [trustScore, setTrustScore] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);

  useEffect(() => {
    initDatabase();
    loadVerificationCount();
  }, []);

  const loadVerificationCount = async () => {
    const count = await getVerificationCount();
    setVerificationCount(count);
  };

  const handleVerify = async () => {
    try {
      const biometricAvailable = await isBiometricAvailable();
      if (!biometricAvailable) {
        Alert.alert('Error', 'Biometric authentication not available');
        return;
      }

      const authResult = await authenticateUser();
      if (!authResult.success) {
        Alert.alert('Error', 'Authentication failed');
        return;
      }

      const sensorData = await collectBehavioralData();
      const entropy = calculateMovementEntropy(sensorData);

      const score = calculateTrustScore({
        biometricSuccess: true,
        movementEntropy: entropy,
        deviceReputation: 0.8,
        verificationHistory: verificationCount,
      });

      setTrustScore(score);

      const token = await generateVerificationToken('user123', score);
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000;

      await saveVerification({
        timestamp: Date.now(),
        trustScore: score,
        service: 'manual',
        token,
      });

      await loadVerificationCount();

      return { token, expiryTime };
    } catch (error) {
      Alert.alert('Error', String(error));
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HumanGuard</Text>
      <Text style={styles.subtitle}>Prove you're human, instantly</Text>

      <TrustScoreGauge score={trustScore} />

      <VerificationButton onVerify={handleVerify} />

      <Text style={styles.count}>
        {verificationCount} verification{verificationCount !== 1 ? 's' : ''} completed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 40,
  },
  count: {
    marginTop: 20,
    fontSize: 14,
    color: '#8E8E93',
  },
});
