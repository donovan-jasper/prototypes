import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const PremiumBanner = () => {
  const router = useRouter();

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Upgrade to Premium for unlimited features</Text>
      <TouchableOpacity onPress={() => router.push('/paywall')}>
        <Text style={styles.link}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default PremiumBanner;
