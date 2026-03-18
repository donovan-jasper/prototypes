import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert, Image, TextInput, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { scanDocument, hasValidOCR } from '@/lib/ocr';
import { extractTransaction } from '@/lib/parser';
import { addDocument, addTransaction } from '@/lib/database';
import { hashDocument } from '@/lib/crypto';
import { isFreeTier } from '@/lib/subscription';

export default function CaptureScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [manualEntry, setManualEntry] = useState({
    date: '',
    amount: '',
    payee: '',
  });
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleTakePhoto = async () => {
    if (await isFreeTier()) {
      Alert.alert(
        'Free Tier Limit Reached',
        'You have reached the limit of 50 documents in the free tier. Please upgrade to add more documents.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        await processDocument(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleUploadDocument = async () => {
    if (await isFreeTier()) {
      Alert.alert(
        'Free Tier Limit Reached',
        'You have reached the limit of 50 documents in the free tier. Please upgrade to add more documents.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        await processDocument(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const processDocument = async (uri: string) => {
    setIsLoading(true);
    setCapturedImage(uri);
    
    try {
      const extractedText = await scanDocument(uri);
      setOcrText(extractedText);

      if (hasValidOCR(extractedText)) {
        const transaction = extractTransaction(extractedText);
        if (transaction) {
          setManualEntry({
            date: transaction.date.toISOString().split('T')[0],
            amount: transaction.amount.toString(),
            payee: transaction.payee,
          });
        }
      }
      
      setShowManualEntry(true);
    } catch (error) {
      console.error('Error processing document:', error);
      Alert.alert('Error', 'Failed to process document. Please enter details manually.');
      setShowManualEntry(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No image captured.');
      return;
    }

    if (!manualEntry.date || !manualEntry.amount || !manualEntry.payee) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const hash = await hashDocument(capturedImage);
      const amount = parseFloat(manualEntry.amount);
      
      const docId = await addDocument({
        uri: capturedImage,
        hash,
        uploadDate: new Date(),
        ocrText: ocrText || `${manualEntry.payee} - ${manualEntry.date} - $${manualEntry.amount}`,
      });

      await addTransaction({
        id: '',
        date: new Date(manualEntry.date),
        amount,
        payee: manualEntry.payee,
        type: amount >= 0 ? 'deposit' : 'withdrawal',
        documentId: docId,
        documentHash: hash,
      });

      Alert.alert('Success', 'Document and transaction saved successfully.');
      
      // Reset form
      setCapturedImage(null);
      setOcrText('');
      setManualEntry({ date: '', amount: '', payee: '' });
      setShowManualEntry(false);
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setOcrText('');
    setManualEntry({ date: '', amount: '', payee: '' });
    setShowManualEntry(false);
  };

  if (showManualEntry && capturedImage) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.previewContainer}>
          <Text style={styles.title}>Review & Edit Transaction</Text>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-03-18"
              value={manualEntry.date}
              onChangeText={(text) => setManualEntry({ ...manualEntry, date: text })}
            />

            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="100.00"
              keyboardType="numeric"
              value={manualEntry.amount}
              onChangeText={(text) => setManualEntry({ ...manualEntry, amount: text })}
            />

            <Text style={styles.label}>Payee</Text>
            <TextInput
              style={styles.input}
              placeholder="Store Name"
              value={manualEntry.payee}
              onChangeText={(text) => setManualEntry({ ...manualEntry, payee: text })}
            />

            {ocrText && (
              <View style={styles.ocrContainer}>
                <Text style={styles.ocrLabel}>Extracted Text:</Text>
                <Text style={styles.ocrText}>{ocrText}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.instructions}>
          Capture or upload a receipt, bank statement, or invoice
        </Text>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleTakePhoto}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleUploadDocument}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Upload Document</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    width: '80%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 8,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  ocrContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  ocrLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  ocrText: {
    fontSize: 12,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
