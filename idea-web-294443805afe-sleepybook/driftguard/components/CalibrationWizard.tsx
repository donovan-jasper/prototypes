import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { saveCalibrationData } from '@/lib/storage/database';

const CalibrationWizard = () => {
  const [step, setStep] = useState(1);
  const [motionThreshold, setMotionThreshold] = useState(0.05);
  const [soundThreshold, setSoundThreshold] = useState(30);
  const [lightThreshold, setLightThreshold] = useState(50);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      saveCalibrationData({ motionThreshold, soundThreshold, lightThreshold });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calibration Wizard</Text>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>Step 1: Sit still for 60 seconds</Text>
          <Text style={styles.instruction}>We'll measure your baseline motion.</Text>
        </View>
      )}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>Step 2: Make some noise</Text>
          <Text style={styles.instruction}>We'll measure your ambient sound level.</Text>
        </View>
      )}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>Step 3: Adjust your screen brightness</Text>
          <Text style={styles.instruction}>We'll measure your ambient light level.</Text>
        </View>
      )}
      <Button title="Next" onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
  },
});

export default CalibrationWizard;
