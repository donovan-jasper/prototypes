import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Contact } from '../types';

interface InsightChartProps {
  contacts: Contact[];
}

export default function InsightChart({ contacts }: InsightChartProps) {
  const theme = useTheme();

  // Calculate health distribution
  const healthCounts = {
    good: 0,
    warning: 0,
    error: 0,
  };

  contacts.forEach(contact => {
    const daysSinceLastContact = Math.floor(
      (new Date().getTime() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastContact > contact.frequency * 1.5) {
      healthCounts.error++;
    } else if (daysSinceLastContact > contact.frequency) {
      healthCounts.warning++;
    } else {
      healthCounts.good++;
    }
  });

  const total = contacts.length;
  const goodPercent = (healthCounts.good / total) * 100;
  const warningPercent = (healthCounts.warning / total) * 100;
  const errorPercent = (healthCounts.error / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <View
          style={[
            styles.bar,
            { width: `${goodPercent}%`, backgroundColor: theme.colors.success },
          ]}
        />
        <View
          style={[
            styles.bar,
            { width: `${warningPercent}%`, backgroundColor: theme.colors.warning },
          ]}
        />
        <View
          style={[
            styles.bar,
            { width: `${errorPercent}%`, backgroundColor: theme.colors.error },
          ]}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
          <Text variant="bodySmall">Good ({healthCounts.good})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
          <Text variant="bodySmall">Warning ({healthCounts.warning})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
          <Text variant="bodySmall">Error ({healthCounts.error})</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
});
