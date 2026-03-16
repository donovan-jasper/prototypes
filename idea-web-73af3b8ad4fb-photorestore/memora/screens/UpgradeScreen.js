import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { upgradeToPremium } from '../store/userSlice';

const UpgradeScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleUpgrade = () => {
    dispatch(upgradeToPremium());
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.description}>
        Unlock unlimited restorations, batch processing, and exclusive filters.
      </Text>
      <Button title="Upgrade Now" onPress={handleUpgrade} />
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
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default UpgradeScreen;
