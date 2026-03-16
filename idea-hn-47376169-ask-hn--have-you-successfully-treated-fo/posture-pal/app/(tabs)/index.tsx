import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useStore } from '@/store/useStore';
import { StreakCounter } from '@/components/StreakCounter';
import { PainTracker } from '@/components/PainTracker';

export default function HomeScreen() {
  const { streak, painLevel } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PosturePal</Text>
      <StreakCounter streak={streak} />
      <PainTracker painLevel={painLevel} />
      <Link href="/routine/active" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start Daily Routine</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
