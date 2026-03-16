import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from '@/store/useStore';
import { LineChart } from 'react-native-gifted-charts';

export function PainTracker({ painHistory }) {
  const { logPain } = useStore();

  const data = painHistory.map((entry, index) => ({
    value: entry.level,
    label: `Day ${index + 1}`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pain Tracker</Text>
      <LineChart
        data={data}
        width={300}
        height={200}
        yAxisLabel=""
        xAxisLabel=""
        color="#007AFF"
      />
      <View style={styles.buttons}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            style={styles.button}
            onPress={() => logPain(level)}
          >
            <Text style={styles.buttonText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
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
  },
});
