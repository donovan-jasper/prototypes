import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface PremiumGateProps {
  title: string;
  description: string;
  featureList: string[];
}

const PremiumGate: React.FC<PremiumGateProps> = ({ title, description, featureList }) => {
  const navigation = useNavigation();

  const handleUpgrade = () => {
    navigation.navigate('settings' as never);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={48} color="#007AFF" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {featureList.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Only $3.99/month or $29.99/year
      </Text>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Why Go Premium?</Text>
        <View style={styles.benefitItem}>
          <Ionicons name="cash-outline" size={24} color="#007AFF" />
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Save Money</Text>
            <Text style={styles.benefitDescription}>Get accurate savings estimates when switching carriers</Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="bar-chart-outline" size={24} color="#007AFF" />
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Data-Driven Decisions</Text>
            <Text style={styles.benefitDescription}>See real performance metrics from thousands of users</Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Reliable Coverage</Text>
            <Text style={styles.benefitDescription}>Make informed decisions before signing contracts</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PremiumGate;
