import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from '@/store/useStore';

export function PremiumGate() {
  const { togglePremium } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock Premium Features</Text>
      <Text style={styles.description}>
        Upgrade to Premium to access the full exercise library, custom routines, and more.
      </Text>
      <TouchableOpacity style={styles.button} onPress={togglePremium}>
        <Text style={styles.buttonText}>Upgrade to Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
