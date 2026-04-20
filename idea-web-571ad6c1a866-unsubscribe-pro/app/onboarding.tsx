import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Text, useTheme, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/user-store';
import { useEmailStore } from '../store/email-store';

const OnboardingScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useUserStore();
  const { scanInbox, isLoading } = useEmailStore();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding and scan inbox
      scanInbox().then(() => {
        router.replace('/(tabs)');
      });
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Image
              source={require('../assets/images/onboarding-1.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              Welcome to InboxZen
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Reclaim your inbox in seconds. Swipe away spam, unsubscribe instantly, and breathe easier with AI-powered email cleanup.
            </Text>
          </>
        );
      case 2:
        return (
          <>
            <Image
              source={require('../assets/images/onboarding-2.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              Smart Scan & Categorize
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Our AI scans your inbox and automatically categorizes emails as promotional, transactional, or important. No manual sorting needed.
            </Text>
          </>
        );
      case 3:
        return (
          <>
            <Image
              source={require('../assets/images/onboarding-3.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              One-Swipe Unsubscribe
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Swipe right to instantly unsubscribe from any sender. We'll find and use their unsubscribe link automatically.
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {getStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <ProgressBar
          progress={step / 3}
          color={theme.colors.primary}
          style={styles.progressBar}
        />

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              mode="outlined"
              onPress={() => setStep(step - 1)}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Back
            </Button>
          )}

          <Button
            mode="contained"
            onPress={handleNext}
            loading={isLoading && step === 3}
            disabled={isLoading}
            style={[styles.button, step > 1 && styles.nextButton]}
            contentStyle={styles.buttonContent}
          >
            {step < 3 ? 'Next' : 'Get Started'}
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 30,
    textAlign: 'center',
    color: 'gray',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  progressBar: {
    marginBottom: 20,
    height: 4,
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
  },
  nextButton: {
    marginLeft: 10,
  },
  buttonContent: {
    height: 40,
  },
});

export default OnboardingScreen;
