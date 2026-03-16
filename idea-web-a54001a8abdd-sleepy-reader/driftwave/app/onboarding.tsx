import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/useUserStore';

const onboardingScreens = [
  {
    title: 'Welcome to DriftWave',
    description: 'Fall asleep faster and wake up refreshed with AI-powered stories and soundscapes that adapt to your sleep cycle in real-time.',
    image: require('../assets/images/onboarding-1.png'),
  },
  {
    title: 'Smart Sleep Detection',
    description: 'Our app uses motion sensors to detect your sleep stages and adjust the audio experience accordingly.',
    image: require('../assets/images/onboarding-2.png'),
  },
  {
    title: 'Personalized Soundscapes',
    description: 'Choose from a variety of stories and soundscapes tailored to help you relax and fall asleep faster.',
    image: require('../assets/images/onboarding-3.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useUserStore();
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image source={onboardingScreens[currentScreen].image} style={styles.image} />
        <Text style={styles.title}>{onboardingScreens[currentScreen].title}</Text>
        <Text style={styles.description}>{onboardingScreens[currentScreen].description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingScreens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentScreen && styles.activePaginationDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentScreen === onboardingScreens.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  skipButton: {
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  footer: {
    padding: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#007AFF',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
