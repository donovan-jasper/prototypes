import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, SafeAreaView, Alert } from 'react-native';
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
                  {deliveryDate.toLocaleDateString()} at {deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={deliveryDate}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={[styles.stepTitle, { marginTop: 30 }]}>Recurring Delivery</Text>
            <View style={styles.recurringOptions}>
              <TouchableOpacity
                style={[styles.recurringOption, !recurringOption && styles.selectedOption]}
                onPress={() => setRecurringOption(null)}
              >
                <Text style={styles.recurringOptionText}>One-time</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.recurringOption, recurringOption === 'weekly' && styles.selectedOption]}
                onPress={() => setRecurringOption('weekly')}
              >
                <Text style={styles.recurringOptionText}>Weekly</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.recurringOption, recurringOption === 'monthly' && styles.selectedOption]}
                onPress={() => setRecurringOption('monthly')}
              >
                <Text style={styles.recurringOptionText}>Monthly</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Payment Details</Text>
            <View style={styles.paymentContainer}>
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  textColor: '#000000',
                }}
                style={{
                  width: '100%',
                  height: 50,
                  marginVertical: 30,
                }}
                onCardChange={(cardDetails) => {
                  setPaymentMethod(cardDetails);
                }}
              />
            </View>

            <View style={styles.orderSummary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Restaurant:</Text>
                <Text style={styles.summaryValue}>{selectedRestaurant?.name || 'Not selected'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery:</Text>
                <Text style={styles.summaryValue}>
                  {deliveryOption === 'now' ? 'Now' :
                   deliveryOption === 'later' ? 'Later today' : 'Scheduled'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recurring:</Text>
                <Text style={styles.summaryValue}>
                  {recurringOption ? recurringOption.charAt(0).toUpperCase() + recurringOption.slice(1) : 'One-time'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total:</Text>
                <Text style={styles.summaryValue}>${selectedRestaurant?.price?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send a Gift</Text>
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View
              key={item}
              style={[
                styles.progressStep,
                step >= item && styles.activeStep
              ]}
            />
          ))}
        </View>

        {renderStepContent()}

        {showDatePicker && (
          <DateTimePicker
            value={deliveryDate}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
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
          <Text style={styles.buttonText}>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  progressStep: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  activeStep: {
    backgroundColor: '#FF6B6B',
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF0F0',
  },
  deliveryOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deliveryOptionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  recurringOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recurringOption: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  recurringOptionText: {
    fontSize: 14,
    color: '#333',
  },
  paymentContainer: {
    marginBottom: 20,
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SendGiftScreen;
