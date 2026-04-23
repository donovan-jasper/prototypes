import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import { getRestaurants } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const SendGiftScreen = () => {
  const router = useRouter();
  const { addGift } = useGiftStore();
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !recipientName) {
      alert('Please enter a recipient name');
      return;
    }
    if (step === 2 && !selectedRestaurant) {
      alert('Please select a restaurant');
      return;
    }
    if (step === 3 && !message) {
      alert('Please enter a message');
      return;
    }

    if (step === 4) {
      // Create the gift
      const newGift = {
        restaurant: selectedRestaurant,
        recipientName,
        message,
        amount: 25, // Default amount, could be calculated based on restaurant
        status: 'pending',
        scheduledFor: deliveryDate,
      };

      addGift(newGift);
      router.push('/gift/success');
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || deliveryDate;
    setShowDatePicker(false);
    setDeliveryDate(currentDate);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Who are you sending to?</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipient's name"
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>
        );
      case 2:
        if (restaurants.length === 0 && !loading) {
          fetchRestaurants();
        }

        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose a restaurant</Text>
            {loading ? (
              <Text>Loading restaurants...</Text>
            ) : (
              <FlatList
                data={restaurants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.restaurantItem,
                      selectedRestaurant?.id === item.id && styles.selectedRestaurant,
                    ]}
                    onPress={() => setSelectedRestaurant(item)}
                  >
                    <Image source={{ uri: item.image }} style={styles.restaurantImage} />
                    <View style={styles.restaurantInfo}>
                      <Text style={styles.restaurantName}>{item.name}</Text>
                      <Text style={styles.restaurantDetails}>
                        {item.cuisine} • {item.rating} ★ • {item.deliveryTime} min
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Add a personal message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Write your message..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.voiceNoteButton}>
              <Text style={styles.voiceNoteText}>+ Add Voice Note</Text>
            </TouchableOpacity>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>When should we deliver?</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {deliveryDate.toLocaleString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={deliveryDate}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              step >= s && styles.activeProgressStep,
            ]}
          />
        ))}
      </View>

      {renderStepContent()}

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {step === 4 ? 'Confirm & Pay' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  progressStep: {
    width: 60,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  activeProgressStep: {
    backgroundColor: '#FF6B6B',
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  voiceNoteButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  voiceNoteText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  restaurantItem: {
    flexDirection: 'row',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedRestaurant: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantDetails: {
    color: '#666',
    fontSize: 14,
  },
  datePickerButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SendGiftScreen;
