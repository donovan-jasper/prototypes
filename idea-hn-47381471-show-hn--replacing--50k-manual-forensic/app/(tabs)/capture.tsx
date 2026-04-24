import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { useOCR, TextBlock } from 'vision-camera-ocr';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { extractTransaction } from '@/lib/parser';
import { hashDocument } from '@/lib/crypto';
import { addDocument, addTransaction } from '@/lib/database';
import { isFreeTier, showPaywall } from '@/lib/subscription';
import { useOnDeviceOCR } from '@/lib/ocr';

export default function CaptureScreen() {
  const cameraRef = useRef<Camera>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [payee, setPayee] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const {
    device,
    format,
    frameProcessor,
    processImage: processImageWithOCR,
    isProcessing: isOcrProcessing,
    error: ocrError,
  } = useOnDeviceOCR();

  const resetForm = () => {
    setImageUri(null);
    setOcrText('');
    setDate('');
    setAmount('');
    setPayee('');
    setError(null);
    setIsCameraActive(false);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      setIsCameraActive(true);
    } catch (err) {
      setError('Failed to access camera. Please try again.');
      console.error('Camera error:', err);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        enableShutterSound: false,
      });

      const uri = `file://${photo.path}`;
      await processImage(uri);
      setIsCameraActive(false);
    } catch (err) {
      setError('Failed to take photo. Please try again.');
      console.error('Camera capture error:', err);
    } finally {
      setIsProcessing(false);
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
      // Process with on-device OCR
      const text = await processImageWithOCR(uri);
      setOcrText(text);

      // Parse transaction details
      const transaction = extractTransaction(text);

      if (transaction) {
        setDate(transaction.date.toISOString().split('T')[0]);
        setAmount(Math.abs(transaction.amount).toString());
        setPayee(transaction.payee);
      } else {
        setError('Could not automatically extract transaction details. Please enter manually.');
      }
    } catch (err) {
      setError('Failed to process image with on-device OCR. Please enter details manually.');
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
        ocrText: ocrText,
      });

      // Add transaction to database
      await addTransaction({
        id: '',
        date: new Date(date),
        amount: parsedAmount,
        payee: payee,
        type: parsedAmount > 0 ? 'deposit' : 'withdrawal',
        documentId: documentId,
        documentHash: hash,
      });

      Alert.alert('Success', 'Transaction saved successfully!');
      resetForm();
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCameraActive && device) {
    return (
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          format={format}
          frameProcessor={frameProcessor}
        />
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCameraActive(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleTakePhoto}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleUploadDocument}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Upload Document</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
        </View>
      )}

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Processing document...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Payee</Text>
        <TextInput
          style={styles.input}
          value={payee}
          onChangeText={setPayee}
          placeholder="Payee name"
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isProcessing}
        >
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  processingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  errorText: {
    color: '#d32f2f',
  },
  formContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
