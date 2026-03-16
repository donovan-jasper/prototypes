import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';

const SettingsScreen: React.FC = () => {
  const { isPremium, setIsPremium } = useAppContext();

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Premium</Text>
        <Switch
          value={isPremium}
          onValueChange={setIsPremium}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingText: {
    fontSize: 16,
  },
});

export default SettingsScreen;
