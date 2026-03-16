import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const navigation = useNavigation();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Welcome to SkillShot!</Text>
          <Text style={styles.text}>Let's get you started with a quick tutorial.</Text>
          <Button title="Next" onPress={() => setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.title}>Calibration</Text>
          <Text style={styles.text}>Please select your throw type:</Text>
          <Button title="Overhand" onPress={() => setStep(3)} />
          <Button title="Underhand" onPress={() => setStep(3)} />
          <Button title="Sidearm" onPress={() => setStep(3)} />
        </>
      )}
      {step === 3 && (
        <>
          <Text style={styles.title}>First Throw</Text>
          <Text style={styles.text}>Point your camera at a wall and tap to place a target.</Text>
          <Text style={styles.text}>Make a throwing motion with your phone.</Text>
          <Button title="Next" onPress={completeOnboarding} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default OnboardingScreen;
