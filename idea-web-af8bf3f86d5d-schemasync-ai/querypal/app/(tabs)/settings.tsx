import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Switch, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDatabaseStore } from '@/store/database-store';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { offlineMode, toggleOfflineMode, clearCache } = useDatabaseStore();

  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <Text>Offline Mode</Text>
        <Switch value={offlineMode} onValueChange={toggleOfflineMode} />
      </View>
      <Button mode="contained" onPress={clearCache} style={styles.button}>
        Clear Cache
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('subscription')}>
        Subscription Settings
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  button: {
    marginVertical: 16,
  },
});

export default SettingsScreen;
