import { View, Text, StyleSheet } from 'react-native';

export function StreakCounter({ streak }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Streak</Text>
      <Text style={styles.streak}>{streak} days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  streak: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
