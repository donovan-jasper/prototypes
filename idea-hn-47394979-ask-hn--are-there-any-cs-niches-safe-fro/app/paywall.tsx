import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaywallScreen() {
  const router = useRouter();
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Unlock CareerShield Premium</Text>
      <Text style={styles.subtitle}>
        Get the complete toolkit to future-proof your tech career
      </Text>
      
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Unlimited AI Resistance Scores</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Complete Personalized Skill Roadmaps</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Full Job Security Reports</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Career Scenario Planner</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Expert Q&A Access</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Job Posting Analyzer</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.priceButton}>
        <View style={styles.priceContent}>
          <Text style={styles.priceText}>$12.99/month</Text>
          <Text style={styles.priceSubtext}>7-day free trial</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.annualButton}>
        <View style={styles.priceContent}>
          <Text style={styles.annualText}>$99/year</Text>
          <Text style={styles.annualSubtext}>Save $56 + free coaching session</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeText}>Maybe Later</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.restore}>Restore Purchase</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32
  },
  features: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  featureIcon: {
    fontSize: 20,
    color: '#10b981',
    marginRight: 12,
    fontWeight: 'bold'
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1
  },
  priceButton: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  priceContent: {
    alignItems: 'center'
  },
  priceText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  priceSubtext: {
    color: '#bfdbfe',
    fontSize: 14,
    marginTop: 4
  },
  annualButton: {
    backgroundColor: '#8b5cf6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  annualText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  annualSubtext: {
    color: '#e9d5ff',
    fontSize: 14,
    marginTop: 4
  },
  closeButton: {
    padding: 16,
    alignItems: 'center'
  },
  closeText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600'
  },
  restore: {
    color: '#3b82f6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40
  }
});
