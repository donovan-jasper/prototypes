import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { scanDocument, hasValidOCR } from '@/lib/ocr';
import { extractTransaction } from '@/lib/parser';
import { hashDocument } from '@/lib/crypto';
import { addDocument, addTransaction } from '@/lib/database';
import { isFreeTier, showPaywall } from '@/lib/subscription';

export default function CaptureScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [payee, setPayee] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setImageUri(null);
    setOcrText('');
    setDate('');
    setAmount('');
    setPayee('');
    setError(null);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to take photo. Please try again.');
      console.error('Camera error:', err);
    }
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to upload document. Please try again.');
      console.error('Document picker error:', err);
    }
  };

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    setError(null);
    setImageUri(uri);

    try {
      // Extract text using OCR
      const text = await scanDocument(uri);
      setOcrText(text);

      // Check if OCR was successful
      if (hasValidOCR(text)) {
        // Parse transaction details
        const transaction = extractTransaction(text);
        
        if (transaction) {
          setDate(transaction.date.toISOString().split('T')[0]);
          setAmount(Math.abs(transaction.amount).toString());
          setPayee(transaction.payee);
        } else {
          // If parsing fails, allow manual entry
          setError('Could not automatically extract transaction details. Please enter manually.');
        }
      } else {
        // OCR returned empty or failed
        setError('Could not extract text from image. Please enter details manually.');
      }
    } catch (err: any) {
      // Handle specific error types
      if (err.message?.includes('Network error')) {
        setError('Network error: Please check your internet connection and try again.');
      } else if (err.message?.includes('OCR service configuration')) {
        setError('OCR service is not configured. Please enter details manually.');
      } else {
        setError('Failed to process image. Please enter details manually.');
      }
      console.error('OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!imageUri) {
      Alert.alert('Error', 'Please capture or upload a document first.');
      return;
    }

    if (!date || !amount || !payee) {
      Alert.alert('Error', 'Please fill in all fields (date, amount, and payee).');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format.');
      return;
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    // Check free tier limit
    try {
      const isLimitReached = await isFreeTier();
      if (isLimitReached) {
        showPaywall();
        return;
      }
    } catch (err) {
      console.error('Error checking tier:', err);
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Hash the document
      const hash = await hashDocument(imageUri);

      // Add document to database
      const documentId = await addDocument({
        id: '',
        uri: imageUri,
        hash,
        uploadDate: new Date(),
        ocrText,
      });

      // Add transaction to database
      await addTransaction({
        id: '',
        date: new Date(date),
        amount: parsedAmount,
        payee,
        type: parsedAmount >= 0 ? 'deposit' : 'withdrawal',
        documentId: documentId as string,
        documentHash: hash,
      });

      Alert.alert('Success', 'Transaction saved successfully!', [
        { text: 'OK', onPress: resetForm },
      ]);
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTakePhoto}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleUploadDocument}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Upload Document</Text>
        </TouchableOpacity>
      </View>

      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing document...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {imageUri && !isProcessing && (
        <View style={styles.previewContainer}>
          <Text style={styles.sectionTitle}>Document Preview</Text>
          <Image source={{ uri: imageUri }} style={styles.preview} />

          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Payee</Text>
          <TextInput
            style={styles.input}
            placeholder="Store or person name"
            value={payee}
            onChangeText={setPayee}
          />

          <TouchableOpacity
            style={[styles.saveButton, isProcessing && styles.disabledButton]}
            onPress={handleSave}
            disabled={isProcessing}
          >
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={resetForm}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  previewContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
