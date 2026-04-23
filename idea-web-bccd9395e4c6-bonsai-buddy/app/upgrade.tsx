import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, useTheme, Card, List } from 'react-native-paper';
import { useAppContext } from '../contexts/AppContext';
import { useRouter } from 'expo-router';

export default function UpgradeScreen() {
  const { setPremiumStatus } = useAppContext();
  const theme = useTheme();
  const router = useRouter();

  const handleUpgrade = () => {
    // Simulate successful purchase
    setPremiumStatus(true);
    router.replace('/(tabs)/community');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Go Premium
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Unlock all features and support the app
        </Text>
      </View>

      <View style={styles.pricingSection}>
        <Card style={styles.pricingCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.price}>
              $4.99/month
            </Text>
            <Text variant="bodyMedium" style={styles.billingCycle}>
              or $39.99/year (33% savings)
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.featuresSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          What you'll get:
        </Text>

        <List.Section>
          <List.Item
            title="Unlimited plants"
            left={props => <List.Icon {...props} icon="check" color={theme.colors.primary} />}
          />
          <List.Item
            title="Unlimited photos with cloud backup"
            left={props => <List.Icon {...props} icon="check" color={theme.colors.primary} />}
          />
          <List.Item
            title="Full community access (post, comment, react)"
            left={props => <List.Icon {...props} icon="check" color={theme.colors.primary} />}
          />
          <List.Item
            title="Advanced symptom checker"
            left={props => <List.Icon {...props} icon="check" color={theme.colors.primary} />}
          />
          <List.Item
            title="Ad-free experience"
            left={props => <List.Icon {...props} icon="check" color={theme.colors.primary} />}
          />
          <List.Item
            title="Offline plant database"
            left={props => <List.Icon {...props} icon="check" color={theme.colors.primary} />}
          />
          <List.Item
            title="Custom reminder sounds and themes"
            left={props => <List.Icon {...props} icon="check" color={theme.colors.primary} />}
          />
        </List.Section>
      </View>

      <View style={styles.ctaSection}>
        <Button
          mode="contained"
          onPress={handleUpgrade}
          style={styles.upgradeButton}
          contentStyle={styles.buttonContent}
        >
          Start Your Free Trial
        </Button>

        <Text variant="bodySmall" style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Maybe Later
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  pricingSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  pricingCard: {
    borderRadius: 8,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  billingCycle: {
    textAlign: 'center',
    color: '#666',
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  ctaSection: {
    padding: 24,
    backgroundColor: 'white',
  },
  upgradeButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  buttonContent: {
    height: 48,
  },
  termsText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  backButton: {
    marginTop: 8,
  },
});
