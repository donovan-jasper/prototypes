import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Schedule</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Your upcoming sessions will appear here
      </Text>
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
    color: '#666',
    textAlign: 'center',
  },
});
