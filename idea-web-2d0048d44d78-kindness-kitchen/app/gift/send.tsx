import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import { getRestaurants } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import RestaurantPicker from '../../components/RestaurantPicker';
import MessageComposer from '../../components/MessageComposer';

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
  const [deliveryOption, setDeliveryOption] = useState('now');
  const [recurringOption, setRecurringOption] = useState(null);

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

    if (step === 5) {
      // Create the gift
      const newGift = {
        restaurant: selectedRestaurant,
        recipientName,
        message,
        amount: selectedRestaurant?.price || 25,
        status: 'pending',
        scheduledFor: deliveryOption === 'now' ? new Date() : deliveryDate,
        recurring: recurringOption,
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
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="people" size={20} color="#FF6B6B" />
              <Text style={styles.contactButtonText}>Choose from contacts</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose a restaurant</Text>
            <RestaurantPicker onSelectRestaurant={setSelectedRestaurant} />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <MessageComposer onMessageChange={setMessage} />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>When should we deliver?</Text>

            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[styles.deliveryOption, deliveryOption === 'now' && styles.selectedOption]}
                onPress={() => setDeliveryOption('now')}
              >
                <Text style={styles.deliveryOptionText}>Now</Text>
                <Text style={styles.deliveryOptionSubtext}>Delivers in 30-45 min</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deliveryOption, deliveryOption === 'later' && styles.selectedOption]}
                onPress={() => {
                  setDeliveryOption('later');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.deliveryOptionText}>Later today</Text>
                <Text style={styles.deliveryOptionSubtext}>
                  {deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deliveryOption, deliveryOption === 'schedule' && styles.selectedOption]}
                onPress={() => {
                  setDeliveryOption('schedule');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.deliveryOptionText}>Schedule for later</Text>
                <Text style={styles.deliveryOptionSubtext}>
                  {deliveryDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={deliveryDate}
                mode={deliveryOption === 'later' ? 'time' : 'datetime'}
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.recurringContainer}>
              <Text style={styles.recurringTitle}>Make this recurring?</Text>
              <View style={styles.recurringOptions}>
                <TouchableOpacity
                  style={[styles.recurringOption, recurringOption === 'weekly' && styles.selectedRecurring]}
                  onPress={() => setRecurringOption(recurringOption === 'weekly' ? null : 'weekly')}
                >
                  <Text style={styles.recurringOptionText}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.recurringOption, recurringOption === 'monthly' && styles.selectedRecurring]}
                  onPress={() => setRecurringOption(recurringOption === 'monthly' ? null : 'monthly')}
                >
                  <Text style={styles.recurringOptionText}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.recurringOption, recurringOption === 'yearly' && styles.selectedRecurring]}
                  onPress={() => setRecurringOption(recurringOption === 'yearly' ? null : 'yearly')}
                >
                  <Text style={styles.recurringOptionText}>Yearly</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Review your gift</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewTitle}>To: {recipientName}</Text>
                <Text style={styles.reviewSubtitle}>From: You</Text>
              </View>

              <View style={styles.reviewItem}>
                <Ionicons name="restaurant" size={20} color="#FF6B6B" />
                <Text style={styles.reviewText}>{selectedRestaurant?.name}</Text>
              </View>

              <View style={styles.reviewItem}>
                <Ionicons name="chatbubble" size={20} color="#FF6B6B" />
                <Text style={styles.reviewText}>{message.substring(0, 30)}...</Text>
              </View>

              <View style={styles.reviewItem}>
                <Ionicons name="calendar" size={20} color="#FF6B6B" />
                <Text style={styles.reviewText}>
                  {deliveryOption === 'now' ? 'Now' :
                   deliveryOption === 'later' ? 'Later today' :
                   deliveryDate.toLocaleString()}
                </Text>
              </View>

              {recurringOption && (
                <View style={styles.reviewItem}>
                  <Ionicons name="repeat" size={20} color="#FF6B6B" />
                  <Text style={styles.reviewText}>Recurring: {recurringOption}</Text>
                </View>
              )}

              <View style={styles.reviewTotal}>
                <Text style={styles.reviewTotalText}>Total</Text>
                <Text style={styles.reviewTotalAmount}>${selectedRestaurant?.price || 25.00}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.paymentButton}>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.paymentButtonText}>Pay with Stripe</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send a Gift</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {step} of 5</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {step === 5 ? 'Confirm & Pay' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stepIndicator: {
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stepText: {
    color: '#fff',
    fontSize: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
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
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contactButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FF6B6B',
  },
  deliveryOptions: {
    marginBottom: 20,
  },
  deliveryOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  deliveryOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deliveryOptionSubtext: {
    fontSize: 14,
    color: '#666',
  },
  recurringContainer: {
    marginTop: 20,
  },
  recurringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recurringOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recurringOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedRecurring: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  recurringOptionText: {
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  reviewTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reviewTotalText: {
    fontSize: 16,
    color: '#666',
  },
  reviewTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  previousButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#333',
    fontSize: 16,
  },
  nextButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    flex: 1,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SendGiftScreen;
