import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose, onSubscribe }) => {
  const handleSubscribe = () => {
    onSubscribe();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <Text style={styles.title}>Upgrade to Premium</Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>What you'll get:</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Unlimited content library</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Advanced sleep insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Multiple alarms</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Offline mode</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Partner mode</Text>
            </View>
          </View>

          <View style={styles.pricingContainer}>
            <View style={styles.priceOption}>
              <Text style={styles.price}>$7.99</Text>
              <Text style={styles.period}>/month</Text>
            </View>
            <View style={styles.priceOption}>
              <Text style={styles.price}>$59.99</Text>
              <Text style={styles.period}>/year</Text>
              <Text style={styles.savings}>Save 20%</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Subscription will automatically renew for the same package and price unless canceled at least 24 hours before the end of the current period. You can manage your subscription in your device settings.
          </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  priceOption: {
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  period: {
    fontSize: 16,
    color: '#8E8E93',
  },
  savings: {
    fontSize: 14,
    color: '#4CD964',
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default SubscriptionModal;
