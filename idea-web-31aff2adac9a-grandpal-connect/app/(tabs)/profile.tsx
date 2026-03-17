import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('authToken');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Profile</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Your profile settings will appear here
      </Text>
      <Button mode="contained" onPress={handleLogout} style={styles.button}>
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});
