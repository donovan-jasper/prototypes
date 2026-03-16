import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { useStore } from '../../store/appStore';

const SettingsScreen = () => {
  const { isPremium, setIsPremium } = useStore();

  return (
    <View style={styles.container}>
      <View style={styles.premiumCard}>
        <Text style={styles.premiumText}>Upgrade to Premium</Text>
        {/* Premium features list */}
      </View>
      <View style={styles.settingItem}>
        <Text>Auto-switch modes</Text>
        <Switch
          value={isPremium}
          onValueChange={setIsPremium}
          disabled={!isPremium}
        />
      </View>
      {/* Other settings */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  premiumCard: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  premiumText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default SettingsScreen;
