import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RecipientPicker from '../../components/RecipientPicker';
import { Recipient } from '../../types';

const MAX_MESSAGE_LENGTH = 280;

export default function SendGiftScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [step, setStep] = useState(1);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const giftId = params.giftId as string;
  const giftTitle = params.giftTitle as string;
  const giftPrice = params.giftPrice as string;

  const handleRecipientSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setStep(2);
  };

  const handleNextToSummary = () => {
    setStep(3);
  };

  const handleProceedToPayment = () => {
    if (!selectedRecipient) return;

    router.push({
      pathname: '/checkout',
      params: {
        giftId,
        recipientId: selectedRecipient.id.toString(),
        recipientName: selectedRecipient.name,
        message,
        giftTitle,
        giftPrice,
      },
    });
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Choose Recipient</Text>
      <RecipientPicker onSelect={handleRecipientSelect} />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Add a Message (Optional)</Text>
      <Text style={styles.stepSubtitle}>
        To: {selectedRecipient?.name}
      </Text>

      <View style={styles.messageContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Write a personal message..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={handleNextToSummary}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 3: Review & Send</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gift:</Text>
          <Text style={styles.summaryValue}>{giftTitle}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price:</Text>
          <Text style={styles.summaryValue}>${parseFloat(giftPrice).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Recipient:</Text>
          <Text style={styles.summaryValue}>{selectedRecipient?.name}</Text>
        </View>
        {selectedRecipient?.email && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Email:</Text>
            <Text style={styles.summaryValue}>{selectedRecipient.email}</Text>
          </View>
        )}
        {selectedRecipient?.phone && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phone:</Text>
            <Text style={styles.summaryValue}>{selectedRecipient.phone}</Text>
          </View>
        )}
        {message && (
          <View style={styles.messagePreview}>
            <Text style={styles.summaryLabel}>Message:</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.proceedButton]}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]} />
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#007AFF',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageInput: {
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 120,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  messagePreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f5f5f5',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  proceedButton: {
    backgroundColor: '#007AFF',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
