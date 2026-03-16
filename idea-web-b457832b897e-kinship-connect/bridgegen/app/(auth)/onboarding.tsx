import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Welcome to BridgeGen</Text>
          <Text style={styles.description}>
            Connect across generations for meaningful friendships, mentorship, and support.
          </Text>
          <Button title="Next" onPress={nextStep} />
        </View>
      )}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Upload a Photo</Text>
          <Button title="Pick an image from camera roll" onPress={pickImage} />
          {photo && <Image source={{ uri: photo }} style={styles.image} />}
          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={prevStep} />
            <Button title="Next" onPress={nextStep} />
          </View>
        </View>
      )}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.description}>
            Add your interests, availability, and connection goals.
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={prevStep} />
            <Button title="Finish" onPress={() => {}} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
});

export default OnboardingScreen;
