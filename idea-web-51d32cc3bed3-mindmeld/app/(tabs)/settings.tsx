import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useUser } from '../../store/user';

export default function SettingsScreen() {
  const { isPremium, setPremium } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text>Premium Status</Text>
        <Switch value={isPremium} onValueChange={setPremium} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
