import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import VerificationButton from '@/components/VerificationButton';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import { authenticateUser, isBiometricAvailable } from '@/lib/biometrics';
import { getRecentEntropy } from '@/lib/sensors';
import { generateVerificationToken } from '@/lib/crypto';
import { calculateTrustScore } from '@/lib/trustScore';
import { initDatabase, saveVerification, getVerificationCount } from '@/lib/database';
import { useLiveness } from '@/components/LivenessMonitor';

export default function HomeScreen() {
  const [trustScore, setTrustScore] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);
  const { isMonitoring, currentEntropy } = useLiveness();

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

      const entropy = getRecentEntropy();

      const score = calculateTrustScore({
        biometricSuccess: true,
        movementEntropy: entropy,
        deviceReputation: 0.8,
        verificationHistory: verificationCount,
      });

      setTrustScore(score);

      const token = await generateVerificationToken('user123', score);

      await saveVerification({
        timestamp: Date.now(),
        trustScore: score,
        service: 'manual',
        token,
      });

      await loadVerificationCount();

      Alert.alert('Success', `Verified! Trust Score: ${score}`);
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HumanGuard</Text>
      <Text style={styles.subtitle}>Prove you're human, instantly</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, isMonitoring && styles.statusDotActive]} />
        <Text style={styles.statusText}>
          {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
        </Text>
      </View>
      
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
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  count: {
    marginTop: 20,
    fontSize: 14,
    color: '#8E8E93',
  },
});
