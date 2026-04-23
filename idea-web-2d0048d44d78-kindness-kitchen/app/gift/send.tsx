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

            <View style={styles.deliveryOptionContainer}>
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryOption === 'now' && styles.selectedDeliveryOption
                ]}
                onPress={() => setDeliveryOption('now')}
              >
                <Text style={styles.deliveryOptionText}>Now</Text>
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
                <Text style={styles.deliveryOptionText}>Later</Text>
              </TouchableOpacity>
            </View>

            {deliveryOption === 'later' && (
              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Select delivery date and time:</Text>
                <DateTimePicker
                  value={deliveryDate}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              </View>
            )}

            <View style={styles.recurringContainer}>
              <Text style={styles.recurringTitle}>Make this a recurring gift?</Text>
              <View style={styles.recurringOptions}>
                <TouchableOpacity
                  style={[
                    styles.recurringOption,
                    recurringOption === 'weekly' && styles.selectedRecurringOption
                  ]}
                  onPress={() => setRecurringOption(recurringOption === 'weekly' ? null : 'weekly')}
                >
                  <Text style={styles.recurringOptionText}>Weekly</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recurringOption,
                    recurringOption === 'monthly' && styles.selectedRecurringOption
                  ]}
                  onPress={() => setRecurringOption(recurringOption === 'monthly' ? null : 'monthly')}
                >
                  <Text style={styles.recurringOptionText}>Monthly</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recurringOption,
                    recurringOption === 'annually' && styles.selectedRecurringOption
                  ]}
                  onPress={() => setRecurringOption(recurringOption === 'annually' ? null : 'annually')}
                >
                  <Text style={styles.recurringOptionText}>Annually</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Checkout</Text>

            <View style={styles.orderSummary}>
              <Text style={styles.orderSummaryTitle}>Order Summary</Text>
              <View style={styles.orderItem}>
                <Text style={styles.orderItemLabel}>Restaurant:</Text>
                <Text style={styles.orderItemValue}>{selectedRestaurant?.name}</Text>
              </View>
              <View style={styles.orderItem}>
                <Text style={styles.orderItemLabel}>Recipient:</Text>
                <Text style={styles.orderItemValue}>{recipientName}</Text>
              </View>
              <View style={styles.orderItem}>
                <Text style={styles.orderItemLabel}>Delivery:</Text>
                <Text style={styles.orderItemValue}>
                  {deliveryOption === 'now' ? 'Now' : deliveryDate.toLocaleString()}
                </Text>
              </View>
              {recurringOption && (
                <View style={styles.orderItem}>
                  <Text style={styles.orderItemLabel}>Recurring:</Text>
                  <Text style={styles.orderItemValue}>{recurringOption}</Text>
                </View>
              )}
              <View style={styles.orderItem}>
                <Text style={styles.orderItemLabel}>Amount:</Text>
                <Text style={styles.orderItemValue}>${selectedRestaurant?.price.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Payment Method</Text>
              <CardField
                postalCodeEnabled={false}
                placeholder={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={styles.cardField}
                style={styles.cardFieldContainer}
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
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send a Gift</Text>
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View
            key={item}
            style={[
              styles.progressStep,
              step >= item && styles.activeProgressStep,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePrevious}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 5 ? 'Complete Order' : 'Next'}
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  progressStep: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  activeProgressStep: {
    backgroundColor: '#FF6B6B',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginLeft: 8,
  },
  deliveryOptionContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  deliveryOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedDeliveryOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  deliveryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerContainer: {
    marginBottom: 24,
  },
  datePickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  recurringContainer: {
    marginBottom: 24,
  },
  recurringTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: '#666',
  },
  recurringOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recurringOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedRecurringOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  recurringOptionText: {
    fontSize: 14,
    color: '#333',
  },
  orderSummary: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemLabel: {
    fontSize: 16,
    color: '#666',
  },
  orderItemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paymentContainer: {
    marginBottom: 24,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  cardFieldContainer: {
    height: 50,
    marginBottom: 24,
  },
  cardField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    textColor: '#000000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  previousButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SendGiftScreen;
