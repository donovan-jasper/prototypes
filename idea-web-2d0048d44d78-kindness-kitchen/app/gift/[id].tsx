import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import { mockRestaurants } from '../../services/api';

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { gifts, updateGift } = useGiftStore();
  const [gift, setGift] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const restaurant = mockRestaurants.find(r => r.id === id);
    if (restaurant) {
      const existingGift = gifts.find(g => g.restaurant.id === id);
      if (existingGift) {
        setGift(existingGift);
        setRecipientName(existingGift.recipientName);
        setMessage(existingGift.message);
        setAmount(existingGift.amount.toString());
      } else {
        setGift({
          restaurant,
          recipientName: '',
          message: '',
          amount: 0,
          status: 'pending',
          scheduledFor: new Date(),
        });
      }
    }
  }, [id, gifts]);

  if (!gift) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleProceedToCheckout = () => {
    if (!recipientName || !message || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const updatedGift = {
      ...gift,
      recipientName,
      message,
      amount: parseFloat(amount),
    };

    updateGift(updatedGift);
    router.push('/gift/checkout');
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: gift.restaurant.image }} style={styles.restaurantImage} />
      <View style={styles.detailsContainer}>
        <Text style={styles.restaurantName}>{gift.restaurant.name}</Text>
        <Text style={styles.restaurantCuisine}>{gift.restaurant.cuisine}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{gift.restaurant.rating} ★</Text>
          <Text style={styles.deliveryTime}>{gift.restaurant.deliveryTime} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Recipient Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Recipient's Name"
          value={recipientName}
          onChangeText={setRecipientName}
        />

        <Text style={styles.sectionTitle}>Personal Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Write a message for your recipient..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Gift Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount ($)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleProceedToCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  detailsContainer: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginRight: 8,
  },
  deliveryTime: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkoutButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RestaurantDetailScreen;
