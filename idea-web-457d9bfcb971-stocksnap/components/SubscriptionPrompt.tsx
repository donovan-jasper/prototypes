import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface SubscriptionPromptProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ visible, onClose, onUpgrade }) => {
  const features = [
    { icon: 'mic', text: 'Audio summaries of daily digest' },
    { icon: 'search', text: 'Unlimited stock searches' },
    { icon: 'book', text: 'Full lesson library' },
    { icon: 'notifications', text: 'Advanced price alerts' },
    { icon: 'bar-chart', text: 'Compare up to 5 stocks' },
    { icon: 'download', text: 'Export watchlist data' },
    { icon: 'trophy', text: 'Earn badges for learning' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Unlock all features for just $7.99/month</Text>

          <ScrollView style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  laterButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  laterButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

export default SubscriptionPrompt;
