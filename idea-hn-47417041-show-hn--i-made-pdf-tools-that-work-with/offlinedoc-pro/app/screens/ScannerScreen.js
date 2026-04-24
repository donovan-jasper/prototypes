import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import ImageScanner from '../components/ImageScanner';
import { convertImageToPDF } from '../utils/pdfProcessor';

const ScannerScreen = ({ navigation }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (imageUri) => {
    if (!imageUri) {
      Alert.alert('Error', 'No image captured');
      return;
    }

    try {
      setIsProcessing(true);
      // In a real app, you would load the image data here
      // For this example, we'll simulate the conversion
      const pdfData = await convertImageToPDF(imageUri);
      navigation.navigate('Editor', { pdfData });
    } catch (error) {
      Alert.alert('Error', 'Failed to convert image to PDF');
      console.error('Conversion error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageScanner onScan={handleScan} />
      <View style={styles.buttonContainer}>
        <Button
          title={isProcessing ? 'Processing...' : 'Scan Document'}
          onPress={() => {}}
          disabled={isProcessing}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default ScannerScreen;
