import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';

const SettingsScreen = () => {
  const { syncFrequency, setSyncFrequency, duplicateDetection, setDuplicateDetection } = useSettingsStore();

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.text}>Sync Frequency</Text>
        <Text style={styles.value}>{syncFrequency}</Text>
      </View>
      <View style={styles.setting}>
        <Text style={styles.text}>Duplicate Detection</Text>
        <Switch
          value={duplicateDetection}
          onValueChange={setDuplicateDetection}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
});

export default SettingsScreen;
