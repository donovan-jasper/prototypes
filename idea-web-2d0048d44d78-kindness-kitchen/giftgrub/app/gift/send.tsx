import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import RestaurantPicker from '../../components/RestaurantPicker';
import MessageComposer from '../../components/MessageComposer';

const SendGiftScreen = () => {
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [message, setMessage] = useState('');
  const { addGift } = useGiftStore();
  const router = useRouter();

  const handleNext = () => {
    if (step === 1 && recipientName) {
      setStep(2);
    } else if (step === 2 && restaurant) {
      setStep(3);
    } else if (step === 3 && message) {
      const newGift = {
        recipientName,
        restaurant: restaurant.name,
        message,
        status: 'preparing',
      };
      addGift(newGift);
      router.push('/(tabs)/history');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send a Gift</Text>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Recipient</Text>
          <TextInput
            style={styles.input}
            placeholder="Recipient's Name"
            value={recipientName}
            onChangeText={setRecipientName}
          />
        </View>
      )}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Choose a Restaurant</Text>
          <RestaurantPicker onSelect={setRestaurant} />
        </View>
      )}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Add a Message</Text>
          <MessageComposer onMessageChange={setMessage} />
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>{step === 3 ? 'Send Gift' : 'Next'}</Text>
      </TouchableOpacity>
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
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default SendGiftScreen;
