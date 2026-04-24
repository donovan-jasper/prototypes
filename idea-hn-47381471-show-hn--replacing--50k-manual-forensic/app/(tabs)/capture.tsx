import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch, Picker } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { useIsFocused } from '@react-navigation/native';
import { scanDocument } from '../../lib/ocr';
import { extractTransaction } from '../../lib/parser';
import { addTransaction, addDocument } from '../../lib/database';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { hashDocument } from '../../lib/crypto';
import { v4 as uuidv4 } from 'uuid';

export default function CaptureScreen() {
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'credit card'>('checking');
  const [interestRate, setInterestRate] = useState('');
  const [includeInterest, setIncludeInterest] = useState(false);

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('withdrawal');
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
  ]);
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  const takePhoto = async () => {
    if (!camera.current) return;

    setIsProcessing(true);
    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        enableShutterSound: false,
      });

      // Save photo to file system
      const fileUri = `${FileSystem.documentDirectory}documents/${uuidv4()}.jpg`;
      await FileSystem.moveAsync({
        from: photo.path,
        to: fileUri,
      });

      setDocumentUri(fileUri);

      // Process the document
      await processDocument(fileUri);
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = `${FileSystem.documentDirectory}documents/${uuidv4()}.jpg`;

        // Copy the selected image to our documents directory
        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: fileUri,
        });

        setDocumentUri(fileUri);

        // Process the document
        await processDocument(fileUri);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const processDocument = async (uri: string) => {
    setIsProcessing(true);
    try {
      // Extract text using OCR
      const text = await scanDocument(uri);
      setOcrText(text);

      // Parse transaction details
      const parsed = extractTransaction(text);
      if (parsed) {
        setDate(parsed.date.toISOString().split('T')[0]);
        setAmount(parsed.amount.toFixed(2));
        setPayee(parsed.payee);
      }
    } catch (error) {
      console.error('Document processing error:', error);
      Alert.alert('Error', 'Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTransaction = async () => {
    if (!documentUri) {
      Alert.alert('Error', 'No document captured or selected');
      return;
    }

    if (!date || !amount || !payee) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      // Generate document hash
      const documentHash = await hashDocument(documentUri);

      // Create document record
      const documentId = uuidv4();
      await addDocument({
        id: documentId,
        uri: documentUri,
        hash: documentHash,
        uploadDate: new Date(),
        ocrText,
      });

      // Create transaction record
      const transactionId = uuidv4();
      await addTransaction({
        id: transactionId,
        date: new Date(date),
        amount: parseFloat(amount),
        payee,
        type,
        documentId,
        documentHash,
        recurring: isRecurring ? {
          frequency,
          endDate: undefined // Could add end date field if needed
        } : undefined,
        accountType,
        interestRate: includeInterest ? parseFloat(interestRate) || 0 : 0
      });

      Alert.alert('Success', 'Transaction saved successfully');
      // Reset form
      setDate('');
      setAmount('');
      setPayee('');
      setDocumentUri(null);
      setOcrText('');
      setIsRecurring(false);
      setIncludeInterest(false);
      setInterestRate('');
    } catch (error) {
      console.error('Save transaction error:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No camera device available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          format={format}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
      )}

      <View style={styles.overlay}>
        <View style={styles.controls}>
          <Button
            title="Take Photo"
            onPress={takePhoto}
            disabled={isProcessing}
          />
          <Button
            title="Upload Document"
            onPress={pickDocument}
            disabled={isProcessing}
          />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
          />

          <Text style={styles.label}>Payee</Text>
          <TextInput
            style={styles.input}
            value={payee}
            onChangeText={setPayee}
            placeholder="Payee name"
          />

          <Text style={styles.label}>Transaction Type</Text>
          <Picker
            selectedValue={type}
            style={styles.picker}
            onValueChange={(itemValue) => setType(itemValue)}
          >
            <Picker.Item label="Withdrawal" value="withdrawal" />
            <Picker.Item label="Deposit" value="deposit" />
          </Picker>

          <Text style={styles.label}>Account Type</Text>
          <Picker
            selectedValue={accountType}
            style={styles.picker}
            onValueChange={(itemValue) => setAccountType(itemValue)}
          >
            <Picker.Item label="Checking" value="checking" />
            <Picker.Item label="Savings" value="savings" />
            <Picker.Item label="Credit Card" value="credit card" />
          </Picker>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Recurring Transaction</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
            />
          </View>

          {isRecurring && (
            <>
              <Text style={styles.label}>Frequency</Text>
              <Picker
                selectedValue={frequency}
                style={styles.picker}
                onValueChange={(itemValue) => setFrequency(itemValue)}
              >
                <Picker.Item label="Daily" value="daily" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Biweekly" value="biweekly" />
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Quarterly" value="quarterly" />
                <Picker.Item label="Yearly" value="yearly" />
              </Picker>
            </>
          )}

          {accountType === 'savings' && (
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Include Interest</Text>
              <Switch
                value={includeInterest}
                onValueChange={setIncludeInterest}
              />
            </View>
          )}

          {includeInterest && (
            <>
              <Text style={styles.label}>Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </>
          )}

          <Button
            title={isProcessing ? "Processing..." : "Save Transaction"}
            onPress={saveTransaction}
            disabled={isProcessing || !documentUri}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  picker: {
    height: 50,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
