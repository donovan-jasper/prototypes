import React from 'react';
import { View, Image, StyleSheet, Text, ScrollView } from 'react-native';

const GalleryScreen = ({ route }) => {
  const { originalImage, restoredImage, quality } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restoration Complete!</Text>
      <Text style={styles.qualityText}>Quality Score: {(quality * 100).toFixed(0)}%</Text>
      
      <View style={styles.imageSection}>
        <Text style={styles.label}>Original</Text>
        <Image source={{ uri: originalImage }} style={styles.image} />
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.label}>Restored</Text>
        <Image source={{ uri: restoredImage }} style={styles.image} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qualityText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  imageSection: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
  },
});

export default GalleryScreen;
