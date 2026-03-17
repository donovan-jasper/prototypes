import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../src/context/AppContext';

export default function PremiumScreen() {
  const router = useRouter();
  const { isPremium } = useAppContext();

  const handleUpgrade = () => {
    // In a real app, this would integrate with a payment processor
    alert('Upgrade functionality would be implemented here');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FlowBreak Premium</Text>
        <Text style={styles.subtitle}>Unlock the full potential of your mindfulness practice</Text>
      </View>

      <View style={styles.pricingContainer}>
        <View style={styles.priceCard}>
          <Text style={styles.price}>$7.99</Text>
          <Text style={styles.period}>per month</Text>
        </View>
        <View style={styles.priceCard}>
          <Text style={styles.price}>$59.99</Text>
          <Text style={styles.period}>per year</Text>
          <Text style={styles.savings}>Save 25%</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Premium Features</Text>

        <View style={styles.featureList}>
          <FeatureItem
            icon="⏳"
            title="Unlimited Moments"
            description="Take up to 10 moments per day, whenever you need them"
          />
          <FeatureItem
            icon="📅"
            title="Advanced Timing"
            description="Calendar integration and location-based triggers"
          />
          <FeatureItem
            icon="🎧"
            title="All Voices"
            description="Choose from 5 different voice options, including celebrity voices"
          />
          <FeatureItem
            icon="📊"
            title="Deep Analytics"
            description="Detailed stress patterns and weekly reports"
          />
          <FeatureItem
            icon="🎤"
            title="Custom Moments"
            description="Record your own voice and create personal prompts"
          />
          <FeatureItem
            icon="⚡"
            title="Emergency Calm"
            description="Instant access to a calming moment when you need it most"
          />
          <FeatureItem
            icon="🔗"
            title="Integrations"
            description="Connect with Apple Health, Google Fit, and calendar apps"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={handleUpgrade}
      >
        <Text style={styles.upgradeButtonText}>
          {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
        </Text>
      </TouchableOpacity>

      {isPremium && (
        <Text style={styles.premiumStatus}>Your premium subscription is active</Text>
      )}
    </ScrollView>
  );
}

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 24,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  priceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  period: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  savings: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: 'bold',
  },
  featuresContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumStatus: {
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
