import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export default function OnboardingScreen() {
  const { theme } = useContext(SettingsContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Welcome to SimpliPhone</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Your phone, simplified</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => console.log('Get started pressed')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  button: {
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
