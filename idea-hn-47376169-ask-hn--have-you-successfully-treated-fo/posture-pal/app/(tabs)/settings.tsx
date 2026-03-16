import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useStore } from '@/store/useStore';
import { PremiumGate } from '@/components/PremiumGate';

export default function SettingsScreen() {
  const { isPremium, notificationsEnabled, toggleNotifications, togglePremium } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.setting}>
        <Text>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>
      {!isPremium && <PremiumGate />}
      {isPremium && (
        <TouchableOpacity style={styles.button} onPress={togglePremium}>
          <Text style={styles.buttonText}>Cancel Premium</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
