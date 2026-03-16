import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { scanDocument } from '@/lib/ocr';
import { extractTransaction } from '@/lib/parser';
import { addDocument, addTransaction } from '@/lib/database';
import { hashDocument } from '@/lib/crypto';
import { isFreeTier } from '@/lib/subscription';

export default function CaptureScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    if (await isFreeTier()) {
      Alert.alert(
        'Free Tier Limit Reached',
        'You have reached the limit of 50 documents in the free tier. Please upgrade to add more documents.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        await processDocument(result.uri);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processDocument = async (uri) => {
    try {
      const hash = await hashDocument(uri);
      const ocrText = await scanDocument(uri);
      const transaction = extractTransaction(ocrText);

      if (transaction) {
        const docId = await addDocument({
          uri,
          hash,
          uploadDate: new Date(),
          ocrText,
        });

        await addTransaction({
          ...transaction,
          documentId: docId,
          documentHash: hash,
        });

        Alert.alert('Success', 'Document and transaction saved successfully.');
      } else {
        Alert.alert('Error', 'Could not extract transaction details from the document.');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      Alert.alert('Error', 'Failed to process document. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Take Photo"
        onPress={handleTakePhoto}
        disabled={isLoading}
      />
      <Button
        title="Upload Document"
        onPress={handleUploadDocument}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
