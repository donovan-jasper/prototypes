import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '../../store/settings';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isPro, upgradeToPro } = useSettingsStore();

  const handleUpgrade = () => {
    upgradeToPro();
  };

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <Button
        title={isPro ? 'Pro User' : 'Upgrade to Pro'}
        onPress={handleUpgrade}
        disabled={isPro}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default SettingsScreen;
