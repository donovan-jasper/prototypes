import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const PremiumBanner = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.description}>Get AI-personalized affirmations and more</Text>
      <Button title="Learn More" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#6200ee',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: '#fff',
    marginBottom: 10,
  },
});

export default PremiumBanner;
