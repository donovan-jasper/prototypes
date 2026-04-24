import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Modal } from 'react-native';
import VerificationButton from '@/components/VerificationButton';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { authenticateUser, isBiometricAvailable } from '@/lib/biometrics';
import { getRecentEntropy } from '@/lib/sensors';
import { generateVerificationToken } from '@/lib/crypto';
import { calculateTrustScore, calculatePassiveTrustScore } from '@/lib/trustScore';
import { initDatabase, saveVerification, getVerificationCount, updateDeviceReputation, getDeviceReputation } from '@/lib/database';
import { useLiveness } from '@/components/LivenessMonitor';

export default function HomeScreen() {
  const [trustScore, setTrustScore] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentToken, setCurrentToken] = useState('');
  const [tokenExpiry, setTokenExpiry] = useState(0);
  const [isPassiveMode, setIsPassiveMode] = useState(true);
  const [deviceReputation, setDeviceReputation] = useState(0.5);
  const { isMonitoring, currentEntropy } = useLiveness();

  useEffect(() => {
    initDatabase();
    loadVerificationCount();
    loadDeviceReputation();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPassiveMode) {
        const entropy = getRecentEntropy();
        const reputation = await getDeviceReputation();

        const passiveScore = calculatePassiveTrustScore(
          entropy,
          reputation,
          verificationCount
        );

        setTrustScore(passiveScore);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPassiveMode, verificationCount]);

  const loadVerificationCount = async () => {
    const count = await getVerificationCount();
    setVerificationCount(count);
  };

  const loadDeviceReputation = async () => {
    const reputation = await getDeviceReputation();
    setDeviceReputation(reputation);
  };

  const handleVerify = async () => {
    try {
      const biometricAvailable = await isBiometricAvailable();
      if (!biometricAvailable) {
        Alert.alert('Error', 'Biometric authentication not available');
        await updateDeviceReputation(false);
        await loadDeviceReputation();
        return;
      }

      const authResult = await authenticateUser();
      if (!authResult.success) {
        Alert.alert('Error', 'Authentication failed');
        await updateDeviceReputation(false);
        await loadDeviceReputation();
        return;
      }

      const entropy = getRecentEntropy();
      const reputation = await getDeviceReputation();

      const score = calculateTrustScore({
        biometricSuccess: true,
        movementEntropy: entropy,
        deviceReputation: reputation,
        verificationHistory: verificationCount,
      });

      setTrustScore(score);
      setIsPassiveMode(false);

      const token = await generateVerificationToken('user123', score);
      const expiry = Date.now() + (24 * 60 * 60 * 1000);

      await saveVerification({
        timestamp: Date.now(),
        trustScore: score,
        service: 'manual',
        token,
      });

      await updateDeviceReputation(true);
      await loadVerificationCount();
      await loadDeviceReputation();

      setCurrentToken(token);
      setTokenExpiry(expiry);
      setShowQRModal(true);
    } catch (error) {
      Alert.alert('Error', String(error));
      await updateDeviceReputation(false);
      await loadDeviceReputation();
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

      <TrustScoreGauge score={trustScore} isPassive={isPassiveMode} />

      <View style={styles.reputationContainer}>
        <Text style={styles.reputationLabel}>Device Reputation</Text>
        <Text style={styles.reputationValue}>{Math.round(deviceReputation * 100)}%</Text>
      </View>

      <VerificationButton onVerify={handleVerify} />

      <Text style={styles.count}>
        {verificationCount} verification{verificationCount !== 1 ? 's' : ''} completed
      </Text>

      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <QRCodeGenerator
            token={currentToken}
            expiryTime={tokenExpiry}
            onClose={() => setShowQRModal(false)}
          />
        </View>
      </Modal>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  reputationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  reputationLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  reputationValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  count: {
    marginTop: 20,
    fontSize: 14,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
