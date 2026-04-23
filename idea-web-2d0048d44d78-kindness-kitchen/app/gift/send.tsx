import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import { getRestaurants } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import RestaurantPicker from '../../components/RestaurantPicker';
import MessageComposer from '../../components/MessageComposer';
import { CardField, useStripe } from '@stripe/stripe-react-native';

const SendGiftScreen = () => {
  const router = useRouter();
  const { addGift } = useGiftStore();
  const { confirmPayment } = useStripe();
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [recipientLocation, setRecipientLocation] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('now');
  const [recurringOption, setRecurringOption] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handleNext = async () => {
    if (step === 1 && (!recipientName || !recipientLocation)) {
      Alert.alert('Please enter recipient name and location');
      return;
    }
    if (step === 2 && !selectedRestaurant) {
      Alert.alert('Please select a restaurant');
      return;
    }
    if (step === 3 && !message) {
      Alert.alert('Please enter a message');
      return;
    }
    if (step === 4 && !paymentMethod) {
      Alert.alert('Please enter payment details');
      return;
    }

    if (step === 5) {
      // Process payment
      setLoading(true);
      try {
        // Create payment intent
        const { paymentIntent, error } = await confirmPayment({
          paymentMethodType: 'Card',
          paymentMethodId: paymentMethod.id,
          amount: Math.round(selectedRestaurant.price * 100), // Convert to cents
          currency: 'USD',
        });

        if (error) {
          Alert.alert('Payment failed', error.message);
          return;
        }

        // Create the gift
        const newGift = {
          restaurant: selectedRestaurant,
          recipientName,
          recipientLocation,
          message,
          amount: selectedRestaurant.price,
          status: 'pending',
          scheduledFor: deliveryOption === 'now' ? new Date() : deliveryDate,
          recurring: recurringOption,
          paymentIntentId: paymentIntent.id,
        };

        addGift(newGift);
        router.push('/gift/success');
      } catch (err) {
        Alert.alert('Error', 'Failed to process payment');
        console.error(err);
      } finally {
        setLoading(false);
      }
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
            <TextInput
              style={styles.input}
              placeholder="Recipient's location"
              value={recipientLocation}
              onChangeText={setRecipientLocation}
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
            <RestaurantPicker
              onSelectRestaurant={setSelectedRestaurant}
              location={recipientLocation}
            />
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
                style={[
                  styles.deliveryOption,
                  deliveryOption === 'now' && styles.selectedDeliveryOption
                ]}
                onPress={() => setDeliveryOption('now')}
              >
                <Text style={[
                  styles.deliveryOptionText,
                  deliveryOption === 'now' && styles.selectedDeliveryOptionText
                ]}>Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryOption === 'later' && styles.selectedDeliveryOption
                ]}
                onPress={() => {
                  setDeliveryOption('later');
                  setShowDatePicker(true);
                }}
              >
                <Text style={[
                  styles.deliveryOptionText,
                  deliveryOption === 'later' && styles.selectedDeliveryOptionText
                ]}>Later</Text>
              </TouchableOpacity>
            </View>

            {deliveryOption === 'later' && (
              <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>Select delivery date:</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {deliveryDate.toLocaleDateString()} at {deliveryDate.toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={deliveryDate}
                    mode="datetime"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            )}

            <View style={styles.recurringContainer}>
              <Text style={styles.recurringTitle}>Make this recurring?</Text>
              <View style={styles.recurringOptions}>
                {['weekly', 'monthly', 'annually'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.recurringOption,
                      recurringOption === option && styles.selectedRecurringOption
                    ]}
                    onPress={() => setRecurringOption(recurringOption === option ? null : option)}
                  >
                    <Text style={[
                      styles.recurringOptionText,
                      recurringOption === option && styles.selectedRecurringOptionText
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Payment Details</Text>

            <View style={styles.paymentSummary}>
              <Text style={styles.summaryLabel}>Restaurant:</Text>
              <Text style={styles.summaryValue}>{selectedRestaurant?.name}</Text>

              <Text style={styles.summaryLabel}>Recipient:</Text>
              <Text style={styles.summaryValue}>{recipientName}</Text>

              <Text style={styles.summaryLabel}>Delivery:</Text>
              <Text style={styles.summaryValue}>
                {deliveryOption === 'now' ? 'Now' : deliveryDate.toLocaleString()}
              </Text>

              {recurringOption && (
                <>
                  <Text style={styles.summaryLabel}>Recurring:</Text>
                  <Text style={styles.summaryValue}>
                    {recurringOption.charAt(0).toUpperCase() + recurringOption.slice(1)}
                  </Text>
                </>
              )}

              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${selectedRestaurant?.price.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentForm}>
              <Text style={styles.paymentTitle}>Enter payment details</Text>
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  textColor: '#000000',
                }}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  setPaymentMethod(cardDetails);
                }}
              />
            </View>
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
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              step >= s && styles.activeProgressStep,
              step > s && styles.completedProgressStep
            ]}
          >
            <Text style={[
              styles.progressStepText,
              step >= s && styles.activeProgressStepText
            ]}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 5 ? 'Confirm Payment' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f8f8',
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeProgressStep: {
    backgroundColor: '#FF6B6B',
  },
  completedProgressStep: {
    backgroundColor: '#4CAF50',
  },
  progressStepText: {
    color: '#999',
    fontWeight: '600',
  },
  activeProgressStepText: {
    color: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 10,
  },
  contactButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FF6B6B',
  },
  deliveryOptions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  deliveryOption: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  selectedDeliveryOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  deliveryOptionText: {
    fontSize: 16,
    color: '#666',
  },
  selectedDeliveryOptionText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  recurringContainer: {
    marginTop: 20,
  },
  recurringTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  recurringOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recurringOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedRecurringOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  recurringOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedRecurringOptionText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  paymentSummary: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
    marginTop: 5,
  },
  paymentForm: {
    marginTop: 20,
  },
  paymentTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  previousButton: {
    backgroundColor: '#f8f8f8',
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendGiftScreen;
