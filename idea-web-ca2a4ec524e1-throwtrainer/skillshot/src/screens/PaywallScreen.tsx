import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../store/useUserStore';

const PaywallScreen = () => {
  const navigation = useNavigation();
  const { upgradeToPremium } = useUserStore();

  const handleSubscribe = () => {
    upgradeToPremium();
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.text}>Unlock all features:</Text>
      <Text style={styles.feature}>- All 5 activity types</Text>
      <Text style={styles.feature}>- Unlimited challenges</Text>
      <Text style={styles.feature}>- AR replay clips</Text>
      <Text style={styles.feature}>- Advanced analytics</Text>
      <Text style={styles.feature}>- Ad-free experience</Text>
      <Button title="Subscribe ($4.99/month)" onPress={handleSubscribe} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  feature: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default PaywallScreen;
