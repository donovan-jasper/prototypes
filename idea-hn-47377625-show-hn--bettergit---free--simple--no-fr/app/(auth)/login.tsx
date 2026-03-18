import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    await login('fake-token-12345');
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="git" size={80} color="#2196F3" />
        <Text style={styles.title}>GitFlow</Text>
        <Text style={styles.subtitle}>Version control for everyone</Text>
        
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="github" size={24} color="#fff" />
          <Text style={styles.loginButtonText}>Continue with GitHub</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Demo mode - no actual authentication required
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#212121',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
    marginBottom: 48,
  },
  loginButton: {
    backgroundColor: '#24292e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: '#9e9e9e',
    marginTop: 24,
    textAlign: 'center',
  },
});
