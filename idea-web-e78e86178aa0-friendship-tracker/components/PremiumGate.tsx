import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePremium } from '../hooks/usePremium';

interface PremiumGateProps {
  featureName: string;
  description: string;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ featureName, description }) => {
  const navigation = useNavigation();
  const { isPremium, upgradeToPremium } = usePremium();

  if (isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mockupContainer}>
        <View style={styles.mockupHeader}>
          <Text style={styles.mockupTitle}>{featureName}</Text>
        </View>

        <View style={styles.mockupContent}>
          <Text style={styles.mockupText}>{description}</Text>

          <View style={styles.mockupChart}>
            <View style={styles.mockupChartBar} />
            <View style={styles.mockupChartBar} />
            <View style={styles.mockupChartBar} />
            <View style={styles.mockupChartBar} />
            <View style={styles.mockupChartBar} />
          </View>

          <View style={styles.mockupList}>
            <View style={styles.mockupListItem}>
              <Text style={styles.mockupListText}>• At-risk friendships</Text>
            </View>
            <View style={styles.mockupListItem}>
              <Text style={styles.mockupListText}>• Personalized suggestions</Text>
            </View>
            <View style={styles.mockupListItem}>
              <Text style={styles.mockupListText}>• Detailed connection trends</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={upgradeToPremium}
      >
        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
      </TouchableOpacity>

      <Text style={styles.benefitsText}>
        Unlock unlimited friends, advanced analytics, and more with BondBuddy Plus
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'center',
  },
  mockupContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mockupHeader: {
    backgroundColor: '#4CAF50',
    padding: 16,
  },
  mockupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  mockupContent: {
    padding: 16,
  },
  mockupText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  mockupChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    height: 100,
  },
  mockupChartBar: {
    width: '15%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    height: '100%',
    opacity: 0.7,
  },
  mockupList: {
    marginBottom: 16,
  },
  mockupListItem: {
    marginBottom: 8,
  },
  mockupListText: {
    fontSize: 16,
    color: '#333',
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefitsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});

export default PremiumGate;
