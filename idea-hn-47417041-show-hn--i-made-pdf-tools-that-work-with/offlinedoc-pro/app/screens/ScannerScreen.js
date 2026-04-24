import React from 'react';
import { View, StyleSheet } from 'react-native';
import ImageScanner from '../components/ImageScanner';

const ScannerScreen = ({ navigation }) => {
  const handleScan = (imageUri) => {
    // Handle scanned image
    navigation.navigate('Editor', { imageUri });
  };

  return (
    <View style={styles.container}>
      <ImageScanner onScan={handleScan} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScannerScreen;
