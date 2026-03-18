import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '@/constants/colors';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumGate({ visible, onClose, onUpgrade }: PremiumGateProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.description}>
            Free users can create up to 3 reminders. Upgrade to Premium for unlimited reminders and more features.
          </Text>
          
          <View style={styles.benefits}>
            <Text style={styles.benefit}>✓ Unlimited reminders</Text>
            <Text style={styles.benefit}>✓ All body zones</Text>
            <Text style={styles.benefit}>✓ Voice-guided exercises</Text>
            <Text style={styles.benefit}>✓ Full tension heatmap</Text>
            <Text style={styles.benefit}>✓ Custom reminder sounds</Text>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeText}>Upgrade for $7.99/month</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefits: {
    marginBottom: 24,
  },
  benefit: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
    paddingLeft: 8,
  },
  upgradeButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: 12,
  },
  closeText: {
    color: Colors.light.icon,
    fontSize: 16,
    textAlign: 'center',
  },
});
